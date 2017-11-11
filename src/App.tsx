import * as React from 'react';
import { Component } from 'react';
import styled from 'styled-components';
import { BigNumber } from 'bignumber.js';
import { ZeroEx, SignedOrder, Token } from '0x.js';
import { RBTree } from 'bintrees';
import { subHours, subMinutes, subDays } from 'date-fns';
import { AppContainer, AppContent, MainPanel, ContentHeader } from './components/MainLayout';
import { TradeTable } from './components/TradeTable';
import { AppHeader } from './components/Header';
import { ZeroExFeed, OrderbookSnapshot } from './components/ZeroExFeed';
import {
  SidePanel,
  SidePanelHeader,
  SidePanelContent,
  SidePanelListItem,
  SidePanelListItemMaker,
  SidePanelListItemTaker,
  SidePanelListItemSwapIcon,
} from './components/SidePanel';
import { ConnectionError } from './components/ConnectionError';
import { AppFooter } from './components/Footer';
import { TimeSince } from './components/TimeSince';
import { LoadingPlaceholder } from './components/Loading';
import { WS } from './components/WebSocket';
const logo = require('./assets/icons/conduit-white.svg');
const exchange = require('./assets/icons/exchange-black.svg');
BigNumber.config({
  EXPONENTIAL_AT: 1000,
});

const BidsAndAsksTablesContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  @media (max-width: 1200px) {
    flex-direction: column;
  }
`;

const IndividualTableContainer = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  @media (min-width: 1201px) {
    padding-right: 1rem;    
  }
`;

export interface TokenPair {
  [key: string]: {
    address: string;
    maxAmount: string;
    minAmount: string;
    precision: number;
  },
}

export interface AppProps {
  restEndpoint: string;
  wsEndpoint: string;
}
export interface AppState {
  connectionStatus: 'connected' | 'disconnected' | 'loading';
  lastWebSocketUpdate?: Date;
  bids: RBTree<SignedOrder>;
  asks: RBTree<SignedOrder>;
  orderDetailsMap: WeakMap<SignedOrder, OrderDetails>;
  recentFills: Array<any>;
  tokens: Array<any>;
  tokenPairs: Array<any>;
  currentBaseTokenAddress: string;
  currentQuoteTokenAddress: string;
}

export interface Token {}

export interface OrderDetails {
  price: BigNumber;
}

// note, app props is bugging out with ts right now (known ts-react issue), setting to any
class App extends Component<AppProps | any, AppState> {
  feed: ZeroExFeed | null;
  constructor(props) {
    super(props);
    this.state = {
      connectionStatus: 'loading',
      bids: new RBTree<SignedOrder>(this.sortOrdersAsc),
      asks: new RBTree<SignedOrder>(this.sortOrdersDesc),
      orderDetailsMap: new WeakMap<SignedOrder, OrderDetails>(),
      recentFills: [],
      tokens: [],
      tokenPairs: [],
      currentBaseTokenAddress: '0x1dad4783cf3fe3085c1426157ab175a6119a04ba',
      currentQuoteTokenAddress: '0x05d090b51c40b020eab3bfcb6a2dff130df22e9c',
    };
  }

  async componentDidMount() {
    const tokens = await this.getTokens();
    const tokenPairs = await this.getTokenPairs();
    this.setState({
      tokens,
      tokenPairs,
    });
    this.setState({ lastWebSocketUpdate: new Date(), connectionStatus: 'connected' });

    const tokenPairToWatch = tokenPairs[1]; // WETH/MKR, todo: make this dynamic
    const [ baseToken, quoteToken ] = Object.values(tokenPairToWatch);
    this.setState({
      currentBaseTokenAddress: baseToken.address,
      currentQuoteTokenAddress: quoteToken.address,
    });
    this.feed &&
      this.feed.subscribeToOrderbook(
        baseToken.address,
        quoteToken.address
      );
  }

  handleSocketMessage = (_: MessageEvent) => this.setState({ lastWebSocketUpdate: new Date() });

  handleSocketClose = () =>
    this.setState({ lastWebSocketUpdate: undefined, connectionStatus: 'disconnected' });

  handleOrderbookUpdate(orderbookUpdate) {
    console.log(orderbookUpdate);
  }

  handleOrderbookFill(fill) {
    console.log(fill);
  }

  handleOrderbookSnapshot = (snapshot: OrderbookSnapshot) => {
    const { bids, asks } = snapshot;
    const { currentBaseTokenAddress, currentQuoteTokenAddress } = this.state;
    const baseSymbol = this.getTokenSymbol(currentBaseTokenAddress);
    const quoteSymbol = this.getTokenSymbol(currentQuoteTokenAddress);

    bids.forEach(bid => {
      const orderDetail = this.computeOrderDetails(
        bid,
        currentBaseTokenAddress,
        currentQuoteTokenAddress
      );
      console.log(
        `BUY: ${orderDetail.baseUnitAmount} ${baseSymbol} for ${orderDetail.quoteUnitAmount} ${
          quoteSymbol
        } (@ ${orderDetail.price} ${quoteSymbol} for each ${baseSymbol})`
      );
      this.addOrderDetails(bid, orderDetail);
      console.log('adding bid', bid);
      this.addBid(bid);
    });
    asks.forEach(ask => {
      const orderDetail = this.computeOrderDetails(
        ask,
        currentBaseTokenAddress,
        currentQuoteTokenAddress
      );
      console.log(
        `SELL: ${orderDetail.baseUnitAmount} ${baseSymbol} for ${orderDetail.quoteUnitAmount} ${
          quoteSymbol
        } (@ ${orderDetail.price} ${quoteSymbol} for each ${baseSymbol})`
      );
      this.addOrderDetails(ask, orderDetail);
      this.addAsk(ask);
    });
  };

  private addOrderDetails(signedOrder: SignedOrder, orderDetails: OrderDetails) {
    this.setState((prevState: AppState) => {
      const { orderDetailsMap } = prevState;
      orderDetailsMap.set(signedOrder, orderDetails);
      return {
        orderDetailsMap,
      };
    });
  }

  private addAsk(ask: SignedOrder) {
    this.setState((prevState: AppState) => {
      const { asks } = prevState;
      asks.insert(ask);
      return { asks };
    });
  }

  private addBid(bid: SignedOrder) {
    this.setState((prevState: AppState) => {
      const { bids } = prevState;
      const foo = bids.insert(bid);
      console.log('REEEE', foo);
      return { bids };
    });
  }

  private getPriceForSignedOrder = signedOrder => {
    let data = this.state.orderDetailsMap.get(signedOrder);
    if (!data) {
      const orderDetail = this.computeOrderDetails(
        signedOrder,
        this.state.currentBaseTokenAddress,
        this.state.currentQuoteTokenAddress
      );
      this.addOrderDetails(signedOrder, orderDetail);
      data = orderDetail;
    }
    return data.price;
  };

  getTokenSymbol(address: string) {
    const token = this.state.tokens.find(x => x.address === address);
    const symbol = token.symbol;
    return symbol;
  }

  private computeOrderDetails = (
    order: SignedOrder,
    baseTokenAddress: string,
    quoteTokenAddress: string
  ) => {
    const makerToken = this.state.tokens.find(t => t.address === order.makerTokenAddress);
    const takerToken = this.state.tokens.find(t => t.address === order.takerTokenAddress);
    const makerUnitAmount = ZeroEx.toUnitAmount(
      new BigNumber(order.makerTokenAmount),
      makerToken.decimals
    );
    const takerUnitAmount = ZeroEx.toUnitAmount(
      new BigNumber(order.takerTokenAmount),
      takerToken.decimals
    );

    // is it a bid (buy) or ask (sell)
    const isBid = (baseTokenAddress === makerToken.address);
    const baseUnitAmount = isBid ? makerUnitAmount : takerUnitAmount;
    const quoteUnitAmount =  isBid ? takerUnitAmount : makerUnitAmount;

    const price: BigNumber = quoteUnitAmount.div(baseUnitAmount);

    return {
      price,
      baseUnitAmount,
      quoteUnitAmount,
    };
  };

  // a - b (todo consolidate these two functions)
  private sortOrdersDesc = (a: SignedOrder, b: SignedOrder) => {
    if (ZeroEx.getOrderHashHex(a) === ZeroEx.getOrderHashHex(b)) {
      return 0;
    }
    const priceA = this.getPriceForSignedOrder(a);
    const priceB = this.getPriceForSignedOrder(b);
    const priceDif = priceA.sub(priceB);
    if (!priceDif.isZero()) {
      return priceDif.toNumber();
    }
    return 1;
  };

  // b - a
  private sortOrdersAsc = (a: SignedOrder, b: SignedOrder) => {
    if (ZeroEx.getOrderHashHex(a) === ZeroEx.getOrderHashHex(b)) {
      return 0;
    }
    const priceA = this.getPriceForSignedOrder(a);
    const priceB = this.getPriceForSignedOrder(b);
    console.log(priceA, priceB);
    const priceDif = priceB.sub(priceB);
    if (!priceDif.isZero()) {
      return priceDif.toNumber();
    }
    return -1;
  };

  private getTokens = async (): Promise<Array<Token>> => {
    const res = await fetch(`${this.props.restEndpoint}/tokens`);
    const json = res.json();
    return json;
  };

  private getTokenPairs = async (): Promise<Array<TokenPair>> => {
    const res = await fetch(`${this.props.restEndpoint}/token_pairs`);
    const json = res.json();
    return json;
  };

  private getMidMarketPrice = (bids: RBTree<SignedOrder>, asks: RBTree<SignedOrder>): BigNumber => {
    if (bids && bids.size > 0 && asks && asks.size > 0) {
      const lowestBid = bids.min();
      const highestAsk = asks.max();
      console.log(lowestBid, highestAsk);

      const midMarketPrice = this.getPriceForSignedOrder(lowestBid)
        .plus(this.getPriceForSignedOrder(highestAsk))
        .div(2);
      return midMarketPrice;
    }
    return new BigNumber(0);
  };

  render() {
    const { lastWebSocketUpdate, connectionStatus, asks, bids } = this.state;

    const midMarketPrice = this.getMidMarketPrice(bids, asks);
    console.log(`Right now one MKR is being sold for mid-market price of ${midMarketPrice.toString()} WETH`);
    console.log(this.state);
    return (
      <AppContainer>
        <ZeroExFeed
          ref={ref => (this.feed = ref)}
          url={this.props.wsEndpoint}
          onMessage={this.handleSocketMessage}
          onClose={this.handleSocketClose}
          onOrderbookSnapshot={this.handleOrderbookSnapshot}
          onOrderbookUpdate={this.handleOrderbookUpdate}
          onOrderbookFill={this.handleOrderbookFill}
        />
        <AppHeader title={'Conduit'} subtitle={'Open Source 0x Relayer'} logo={logo} />
        {connectionStatus === 'disconnected' ? (
          <ConnectionError />
        ) : connectionStatus === 'loading' ? (
          <LoadingPlaceholder />
        ) : (
          <AppContent>
            <MainPanel>
              <ContentHeader>Open Orders</ContentHeader>
              {/* <TablesContainer>
                </BidsTable>
                </AsksTable>
                <TablesContainer/> */}
              <BidsAndAsksTablesContainer>
                <IndividualTableContainer>
                <TradeTable tableId='asks' data={this.state.asks} />
                </IndividualTableContainer>
                <IndividualTableContainer>
                <TradeTable tableId='bids' data={this.state.bids} />
                </IndividualTableContainer>
              </BidsAndAsksTablesContainer>
            </MainPanel>
            <SidePanel>
              <SidePanelHeader>Recent fills</SidePanelHeader>
              <SidePanelContent>
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>
              </SidePanelContent>
            </SidePanel>
          </AppContent>
        )}
        <AppFooter>
          <TimeSince
            date={lastWebSocketUpdate}
            formatter={timeSince => (timeSince ? `Last updated ${timeSince}` : 'Disconnected')}
          />
        </AppFooter>
      </AppContainer>
    );
  }
}

export default App;

// @keyframes highlight {
//   0% {
//     background: red
//   }
//   100% {
//     background: none;
//   }
// }

// #highlight:target {
//   animation: highlight 1s;
// }
