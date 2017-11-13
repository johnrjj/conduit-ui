import * as React from 'react';
import { Component } from 'react';
import styled from 'styled-components';
import { BigNumber } from 'bignumber.js';
import { ZeroEx, SignedOrder, Token } from '0x.js';
import { RBTree } from 'bintrees';
import { subHours, subMinutes, subDays } from 'date-fns';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import { MainPanel } from './MainLayout';
import { TradeTable } from './TradeTable';
import { ContentHeader } from './Common';
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
import { TokenPair } from '../types';
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
    padding-right: ${sizing.spacingSmall};
  }
`;

const OrderbookContainer = styled.div`
  display: flex;
  flex: 1;
  @media (max-width: ${sizing.smallMediaQuery}) {
    flex-direction: column;
  }
`;

export interface OrderbookProps {
  wsEndpoint: string;
  baseToken: Token;
  quoteToken: Token;
}
export interface OrderbookState {
  connectionStatus: 'connected' | 'disconnected' | 'loading';
  lastWebSocketUpdate?: Date;
  bids: RBTree<SignedOrder>;
  asks: RBTree<SignedOrder>;
  orderDetailsMap: WeakMap<SignedOrder, OrderDetails>;
  recentFills: Array<any>;
}

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
    this.feed &&
      this.feed.subscribeToOrderbook(this.props.baseToken.address, this.props.quoteToken.address);
  }

  handleSocketMessage = (_: MessageEvent) =>
    console.log(_) || this.setState({ lastWebSocketUpdate: new Date() });

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
    const { baseToken, quoteToken } = this.props;

    bids.forEach(bid => {
      const orderDetail = this.computeOrderDetails(bid, baseToken.address, quoteToken.address);
      console.log(
        `BUY: ${orderDetail.baseUnitAmount} ${baseToken.symbol} for ${
          orderDetail.quoteUnitAmount
        } ${quoteToken.symbol} (@ ${orderDetail.price} ${quoteToken.symbol} for each ${
          baseToken.symbol
        })`
      );
      this.addOrderDetails(bid, orderDetail);
      this.addBid(bid);
    });
    asks.forEach(ask => {
      const orderDetail = this.computeOrderDetails(ask, baseToken.address, quoteToken.address);
      console.log(
        `SELL: ${orderDetail.baseUnitAmount} ${baseToken.symbol} for ${
          orderDetail.quoteUnitAmount
        } ${quoteToken.symbol} (@ ${orderDetail.price} ${quoteToken.symbol} for each ${
          baseToken.symbol
        })`
      );
      this.addOrderDetails(ask, orderDetail);
      this.addAsk(ask);
    });
  };

  private addOrderDetails(signedOrder: SignedOrder, orderDetails: OrderDetails) {
    this.setState((prevState: OrderbookState) => {
      const { orderDetailsMap } = prevState;
      orderDetailsMap.set(signedOrder, orderDetails);
      return { orderDetailsMap };
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
      bids.insert(bid);
      return { bids };
    });
  }

  private getPriceForSignedOrder = signedOrder => {
    let data = this.state.orderDetailsMap.get(signedOrder);
    if (!data) {
      const orderDetail = this.computeOrderDetails(
        signedOrder,
        this.props.baseToken.address,
        this.props.quoteToken.address
      );
      this.addOrderDetails(signedOrder, orderDetail);
      data = orderDetail;
    }
    return data.price;
  };

  private computeOrderDetails(
    order: SignedOrder,
    baseTokenAddress: string,
    quoteTokenAddress: string
  ) {
    const makerToken =
      this.props.baseToken.address === order.makerTokenAddress
        ? this.props.baseToken
        : this.props.quoteToken;

    const takerToken =
      this.props.baseToken.address === order.takerTokenAddress
        ? this.props.baseToken
        : this.props.quoteToken;

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
  }

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
    // Bids and asks currently exist
    if (bids && bids.size > 0 && asks && asks.size > 0) {
      const currentHighestBid = bids.max(); // highest 'buy'
      const currentLowestAsk = asks.min(); // lowest 'sell'
      console.log(currentHighestBid, currentLowestAsk);
      const midMarketPrice = this.getPriceForSignedOrder(currentHighestBid)
        .plus(this.getPriceForSignedOrder(currentLowestAsk))
        .div(2);
      return midMarketPrice;
    }
    // No bids exist, use ask price
    if (asks && asks.size > 0) {
      return this.getPriceForSignedOrder(asks.min());
    }
    // No bids exist, no one is selling, no price right now...
    return new BigNumber(NaN);
  };

  render() {
    console.log(this.state);
    const { wsEndpoint } = this.props;
    const { lastWebSocketUpdate, connectionStatus, asks, bids } = this.state;
    let asksInOrder: Array<SignedOrder> = [];
    asks.each(a => asksInOrder.push(a));
    let bidsInOrder: Array<SignedOrder> = [];
    bids.each(b => bidsInOrder.push(b));
    const midMarketPrice = this.getMidMarketPrice(bids, asks);
    console.log(
      `Right now one MKR is being sold for mid-market price of ${midMarketPrice.toString()} WETH`
    );
    console.log(this.state);
    return (
      <OrderbookContainer>
        <ZeroExFeed
          ref={ref => (this.feed = ref)}
          url={wsEndpoint}
          onMessage={this.handleSocketMessage}
          onClose={this.handleSocketClose}
          onOrderbookSnapshot={this.handleOrderbookSnapshot}
          onOrderbookUpdate={this.handleOrderbookUpdate}
          onOrderbookFill={this.handleOrderbookFill}
        />
        <MainPanel>
          <ContentHeader>Open Orders</ContentHeader>
          <BidsAndAsksTablesContainer>
            <IndividualTableContainer key="asksTable">
              <TradeTable tableId="asks" data={asksInOrder} />
            </IndividualTableContainer>
            <IndividualTableContainer key="bidsTable">
              <TradeTable tableId="bids" data={bidsInOrder} />
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
      </OrderbookContainer>
    );
  }
}

export { Orderbook };

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
