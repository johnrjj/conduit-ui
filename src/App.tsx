import * as React from 'react';
import { Component } from 'react';
import styled from 'styled-components';
import { BigNumber } from 'bignumber.js';
import { ZeroEx, SignedOrder } from '0x.js';
import { RBTree } from 'bintrees';
import { subHours, subMinutes, subDays } from 'date-fns';
import { AppContainer, AppContent, MainPanel, ContentHeader } from './components/MainLayout';
import { TradeTable, TableFlexGrow } from './components/TradeTable';
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

const dateFiveHoursAgo = subHours(new Date(), 5);
const dateTenMinutesAgo = subMinutes(new Date(), 10);
const dateTwoDaysAgo = subDays(new Date(), 2);

// ZeroEx.toBaseUnitAmount(new BigNumber(1212), 18);
// ZeroEx.toUnitAmount(new BigNumber('12121212'), 18);

// const data = [
//   {
//     index: 0,
//     maker: ZeroEx.toUnitAmount(new BigNumber(10000000000000000000000), 18).toString(),
//     taker: ZeroEx.toBaseUnitAmount(new BigNumber(1000), 18).toString(),
//     exchange: '1 ZRX / 1.3 MKR',
//     date: dateTenMinutesAgo,
//   },
//   {
//     index: 1,
//     maker: '1 WETH',
//     taker: '10.00000 DGB',
//     exchange: '1 WETH / 10 DGB',
//     date: dateFiveHoursAgo,
//   },
//   {
//     index: 2,
//     maker: '7.14 ZRX',
//     taker: '10.100 MKR',
//     exchange: '1 ZRX / 1.3 MKR',
//     date: dateTwoDaysAgo,
//   },
// ];

// https://dribbble.com/shots/3907247-CL-Overview-UI
// https://dribbble.com/shots/3914200-Web-operation-steps

const defaultTokenPairToWatch = {
  baseToken: '0x05d090b51c40b020eab3bfcb6a2dff130df22e9c',
  quoteToken: '0x1dad4783cf3fe3085c1426157ab175a6119a04ba',
};

export interface AppProps {
  restEndpoint: string;
  wsEndpoint: string;
}
export interface AppState {
  connectionStatus: 'connected' | 'disconnected' | 'loading';
  lastWebSocketUpdate?: Date;
  bids: RBTree<SignedOrder>;
  asks: RBTree<SignedOrder>;
  orderDetails: WeakMap<SignedOrder, OrderDetails>;
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
      bids: new RBTree<SignedOrder>((a, b) => 1),
      asks: new RBTree<SignedOrder>((a, b) => -1),
      orderDetails: new WeakMap<SignedOrder, OrderDetails>(),
      recentFills: [],
      tokens: [],
      tokenPairs: [],
      currentBaseTokenAddress: defaultTokenPairToWatch.baseToken,
      currentQuoteTokenAddress: defaultTokenPairToWatch.quoteToken,
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
    this.feed &&
      this.feed.subscribeToOrderbook(
        defaultTokenPairToWatch.baseToken,
        defaultTokenPairToWatch.quoteToken
      );
    console.log(this.state);
  }

  handleSocketMessage = (_: MessageEvent) => this.setState({ lastWebSocketUpdate: new Date() });

  handleSocketClose = () =>
    this.setState({ lastWebSocketUpdate: undefined, connectionStatus: 'disconnected' });

  handleOrderbookUpdate(orderbookUpdate) {
    console.log(orderbookUpdate);
  }

  handleOrderbookSnapshot = (snapshot: OrderbookSnapshot) => {
    const { bids, asks } = snapshot;
    console.log('bids', bids);
    console.log('asks', asks);

    const { currentBaseTokenAddress, currentQuoteTokenAddress } = this.state;

    const getTokenSymbol = (address: string) => {
      const token = this.state.tokens.find(x => x.address === address);
      const symbol = token.symbol;
      return symbol;
    };

    const baseSymbol = getTokenSymbol(currentBaseTokenAddress);
    const quoteSymbol = getTokenSymbol(currentQuoteTokenAddress);

    bids.map(bid => {
      const orderDetail = this.computeOrderDetails(
        bid,
        currentBaseTokenAddress,
        currentQuoteTokenAddress
      );
      console.log(
        `BUY: ${orderDetail.quoteUnitAmount} ${quoteSymbol} for ${orderDetail.baseUnitAmount} ${
          baseSymbol
        } @ ${orderDetail.price}`
      );
    });
    asks.map(ask => {
      const orderDetail = this.computeOrderDetails(
        ask,
        currentBaseTokenAddress,
        currentQuoteTokenAddress
      );
      console.log(
        `SELL: ${orderDetail.quoteUnitAmount} ${quoteSymbol} for ${orderDetail.baseUnitAmount} ${
          baseSymbol
        } ${orderDetail.price}`
      );
    });
  };

  computeOrderDetails = (order: SignedOrder, baseToken: string, quoteToken: string) => {
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

    const baseUnitAmount = baseToken === makerToken.address ? makerUnitAmount : takerUnitAmount;

    const quoteUnitAmount = baseToken === makerToken.address ? takerUnitAmount : makerUnitAmount;

    const price: BigNumber =
      baseToken === makerToken.address
        ? makerUnitAmount.div(takerUnitAmount)
        : takerUnitAmount.div(makerUnitAmount);

    return {
      price,
      baseUnitAmount,
      quoteUnitAmount,
    };
  };

  handleOrderbookFill(fill) {
    console.log(fill);
  }

  private getTokens = async () => {
    const res = await fetch(`${this.props.restEndpoint}/tokens`);
    const json = res.json();
    return json;
  };

  private getTokenPairs = async () => {
    const res = await fetch(`${this.props.restEndpoint}/token_pairs`);
    const json = res.json();
    return json;
  };

  private getTradingSymbol = () => {
    {
    }
  };

  render() {
    const { lastWebSocketUpdate, connectionStatus } = this.state;
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
              <TableFlexGrow>{/* <TradeTable data={data} /> */}</TableFlexGrow>
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

// interface Order {
//   type: string;
//   time: string;
//   state: OrderState;
//   remainingTakerTokenAmount: string;
//   signedOrder: {
//     exchangeContractAddress: string;
//     maker: string;
//     taker: string;
//     makerTokenAddress: string;
//     takerTokenAddress: string;
//     feeRecipient: string;
//     makerTokenAmount: string;
//     takerTokenAmount: string;
//     makerFee: string;
//     takerFee: string;
//     expirationUnixTimestampSec: string;
//     salt: string;
//     ecSignature: {
//       v: number;
//       r: string;
//       s: string;
//     };
//   };
// }
