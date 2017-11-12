import * as React from 'react';
import { Component } from 'react';
import styled from 'styled-components';
import { BigNumber } from 'bignumber.js';
import { ZeroEx, SignedOrder, Token } from '0x.js';
import { RBTree } from 'bintrees';
import { subHours, subMinutes, subDays } from 'date-fns';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import { MainPanel, ContentHeader } from './MainLayout';
import { TradeTable } from './TradeTable';
import { ZeroExFeed, OrderbookSnapshot } from './ZeroExFeed';
import {
  SidePanel,
  SidePanelHeader,
  SidePanelContent,
  SidePanelListItem,
  SidePanelListItemMaker,
  SidePanelListItemTaker,
  SidePanelListItemSwapIcon,
} from './SidePanel';
import sizing from '../util/sizing';
import { WS } from './WebSocket';

const BidsAndAsksTablesContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  @media (max-width: ${sizing.mediumMediaQuery}) {
    flex-direction: column;
  }
`;

const IndividualTableContainer = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  @media (min-width: ${sizing.mediumMediaQuery}) {
    padding-right: 1rem;
  }
`;

const OrderbookContainer = styled.div`
  display: flex;
  flex: 1;
  @media (max-width: ${sizing.smallMediaQuery}) {
    flex-direction: column;
  }
`;

export type OrderType = 'bid' | 'ask';

export interface TokenPair {
  [key: string]: {
    address: string;
    maxAmount: string;
    minAmount: string;
    precision: number;
  };
}

export interface OrderbookProps {
  wsEndpoint: string;
  tokens: Array<Token>;
  tokenPairs: Array<TokenPair>;
  baseTokenAddress: string;
  quoteTokenAddress: string;
}
export interface OrderbookState {
  connectionStatus: 'connected' | 'disconnected' | 'loading';
  lastWebSocketUpdate?: Date;
  bids: RBTree<SignedOrder>;
  asks: RBTree<SignedOrder>;
  orderDetailsMap: WeakMap<SignedOrder, OrderDetails>;
  recentFills: Array<any>;
}

export interface Token {}

export interface OrderDetails {
  price: BigNumber;
}

// note, app props is bugging out with ts right now (known ts-react issue), setting to any
class Orderbook extends Component<OrderbookProps, OrderbookState> {
  feed: ZeroExFeed | null;
  constructor(props) {
    super(props);
    this.state = {
      connectionStatus: 'loading',
      bids: new RBTree<SignedOrder>(this.sortOrdersAsc),
      asks: new RBTree<SignedOrder>(this.sortOrdersDesc),
      orderDetailsMap: new WeakMap<SignedOrder, OrderDetails>(),
      recentFills: [],
    };
  }

  componentDidMount() {
    console.log('orderbook mounted');
    this.feed &&
      this.feed.subscribeToOrderbook(this.props.baseTokenAddress, this.props.quoteTokenAddress);
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
    const { baseTokenAddress, quoteTokenAddress } = this.props;
    const baseSymbol = this.getTokenSymbol(baseTokenAddress);
    const quoteSymbol = this.getTokenSymbol(quoteTokenAddress);

    bids.forEach(bid => {
      const orderDetail = this.computeOrderDetails(bid, baseTokenAddress, quoteTokenAddress);
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
      const orderDetail = this.computeOrderDetails(ask, baseTokenAddress, quoteTokenAddress);
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
    this.setState((prevState: OrderbookState) => {
      const { orderDetailsMap } = prevState;
      orderDetailsMap.set(signedOrder, orderDetails);
      return {
        orderDetailsMap,
      };
    });
  }

  private addAsk(ask: SignedOrder) {
    this.setState((prevState: OrderbookState) => {
      const { asks } = prevState;
      asks.insert(ask);
      return { asks };
    });
  }

  private addBid(bid: SignedOrder) {
    this.setState((prevState: OrderbookState) => {
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
        this.props.baseTokenAddress,
        this.props.quoteTokenAddress
      );
      this.addOrderDetails(signedOrder, orderDetail);
      data = orderDetail;
    }
    return data.price;
  };

  getToken(address: string) {
    const token = this.props.tokens.find(t => t.address === address);
    if (!token) {
      throw new Error('Could not find token');
    }
    return token;
  }

  getTokenSymbol(address: string) {
    const token = this.getToken(address);
    const symbol = token.symbol;
    return symbol;
  }

  private computeOrderDetails = (
    order: SignedOrder,
    baseTokenAddress: string,
    quoteTokenAddress: string
  ) => {
    const makerToken = this.getToken(order.makerTokenAddress);
    const takerToken = this.getToken(order.takerTokenAddress);
    const makerUnitAmount = ZeroEx.toUnitAmount(
      new BigNumber(order.makerTokenAmount),
      makerToken.decimals
    );
    const takerUnitAmount = ZeroEx.toUnitAmount(
      new BigNumber(order.takerTokenAmount),
      takerToken.decimals
    );

    // is it a bid (buy) or ask (sell)
    const isBid = baseTokenAddress === makerToken.address;
    const baseUnitAmount = isBid ? makerUnitAmount : takerUnitAmount;
    const quoteUnitAmount = isBid ? takerUnitAmount : makerUnitAmount;

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
    console.log(
      `Right now one MKR is being sold for mid-market price of ${midMarketPrice.toString()} WETH`
    );
    console.log(this.state);
    return [
      <OrderbookContainer>
        <MainPanel>
          <ContentHeader>Open Orders</ContentHeader>
          <BidsAndAsksTablesContainer>
            <IndividualTableContainer key="asksTable">
              <TradeTable tableId="asks" data={this.state.asks} />
            </IndividualTableContainer>
            <IndividualTableContainer key="bidsTable">
              <TradeTable tableId="bids" data={this.state.bids} />
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
      </OrderbookContainer>,
    ];
  }
}

export { Orderbook };
