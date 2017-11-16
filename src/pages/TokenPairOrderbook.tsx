import * as React from 'react';
import { Component } from 'react';
import styled from 'styled-components';
import { BigNumber } from 'bignumber.js';
import { ZeroEx, SignedOrder, Token } from '0x.js';
import { RBTree } from 'bintrees';
import { subHours, subMinutes, subDays } from 'date-fns';
import { BrowserRouter as Router, Route, Link, NavLink, Switch, NavLinkProps } from 'react-router-dom';
import { MainPanel } from '../components/MainLayout';
import { TradeTable } from '../components/TradeTable';
import { ContentHeader } from '../components/Common';
import { ZeroExFeed, OrderbookSnapshot } from '../components/ZeroExFeed';
import { AppContainer, AppContent } from '../components/MainLayout';
import { AppHeader } from '../components/Header';
import { AppFooter } from '../components/Footer';
import { TimeSince } from '../components/TimeSince';
import { Spinner} from '../components/Spinner';

import { withProps } from '../util/helpers';


const logo = require('../assets/icons/conduit-white.svg');
const exchange = require('../assets/icons/exchange-black.svg');

import {
  SidePanelContainer,
  SidePanel,
  SidePanelHeader,
  SidePanelContent,
  SidePanelListItem,
  SidePanelListItemMaker,
  SidePanelListItemTaker,
  SidePanelListItemSwapIcon,
} from '../components/SidePanel';
import sizing from '../util/sizing';
import { TokenPair } from '../types';


const LeftNavContainer = styled.div`
  background-image: linear-gradient(-180deg, #25206B 0%, #5E4DA3 99%);
  width: 16rem;
  display: flex;
  flex-direction: column;
`;

const LeftNavHeader = styled.div`
  height: 72px;
  margin-bottom: 1rem;
`;

const LeftNavSectionContainer = styled.div`

`;

interface ListItemProps {
  active?: boolean;
}


const LeftNavSectionTitle = styled.div`
font-size: 18px;
color: #79759B;
letter-spacing: 0.5px;
font-weight: 700;
text-transform: uppercase;
padding-left: 20px;
margin-bottom: 1rem;
`;


const activeClassName = 'nav-item-active';

const LeftNavListItemContainer = styled(NavLink).attrs({
  activeClassName
})`
  height: 72px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 20px;
  opacity: 0.8;
  &.${activeClassName} {
    background-image: linear-gradient(-90deg, #2D2672 0%, #282268 100%);
    border-left: 4px solid #66609c;
    padding-left: 16px;
    opacity: 1;
  }
  :hover {
    opacity: 1;
  }
  
`;

const LeftNavListItem = ({ title, subtitle, to }: { title?: string, subtitle?: string, to: string  }) => (
    <LeftNavListItemContainer to={to} activeClassName={activeClassName}>
      <LeftNavListItemTitle>{title}</LeftNavListItemTitle>
      <LeftNavListItemSubtitle>{subtitle}</LeftNavListItemSubtitle>
    </LeftNavListItemContainer>
);

const LeftNavListItemTitle = styled.div`
  font-family: Futura-Medium;
  font-size: 18px;
  color: #DBDAE9;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
`;

const LeftNavListItemSubtitle = styled.div`
  font-family: Futura-Medium;
  font-size: 14px;
  color: #ADA8CD;
  letter-spacing: 0;
`;

// /* Rectangle 16: */
// background-image: linear-gradient(-90deg, #2D2672 0%, #282268 100%);
// /* Rectangle: */
// background: #66609C;
// /* MKR/ETH: */
// font-family: Futura-Medium;
// font-size: 18px;
// color: #DBDAE9;
// letter-spacing: 0;
// /* Maker / Ethereum: */
// font-family: Futura-Medium;
// font-size: 14px;
// color: #ADA8CD;
// letter-spacing: 0;

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
  max-height: 480px;
  flex: 1;
  margin-bottom: 2rem;
  overflow: scroll;
  box-shadow: 0 2px 4px 0 rgba(36, 48, 86, 0.2);
  @media (min-width: ${sizing.mediumMediaQuery}) {
    margin-right: ${sizing.spacingMedium};
  }
`;

const OrderbookContainer = styled.div`
  display: flex;
  height: 100%;
  flex: 1;
  @media (max-width: ${sizing.smallMediaQuery}) {
    flex-direction: column;
    overflow: scroll;
  }
`;

export interface OrderbookProps {
  wsEndpoint: string;
  baseToken: Token;
  quoteToken: Token;
}

export interface OrderbookState {
  loading: boolean;
  bids: RBTree<SignedOrder>;
  asks: RBTree<SignedOrder>;
  orderDetailsMap: WeakMap<SignedOrder, OrderDetails>;
  recentFills: Array<any>;
}

export interface OrderDetails {
  price: BigNumber;
}

class TokenPairOrderbook extends Component<OrderbookProps, OrderbookState> {
  feed: ZeroExFeed | null;
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
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

  componentWillReceiveProps(nextProps: OrderbookProps) {
    if (nextProps.baseToken.address !== this.props.baseToken.address || nextProps.quoteToken.address !== this.props.quoteToken.address) {
      console.log('new pair to look at, resetting state');
      this.setState({
        bids: new RBTree<SignedOrder>(this.sortOrdersAsc),
        asks: new RBTree<SignedOrder>(this.sortOrdersDesc),
        orderDetailsMap: new WeakMap<SignedOrder, OrderDetails>(),
        recentFills: [],
        loading: true,
      });
      this.feed && this.feed.subscribeToOrderbook(nextProps.baseToken.address, nextProps.quoteToken.address);
    }
  }

  handleSocketMessage = (_: MessageEvent) => {};

  handleOrderbookUpdate(orderbookUpdate) {
    console.log(orderbookUpdate);
  }

  handleOrderbookFill(fill) {
    console.log(fill);
  }

  handleOrderbookSnapshot = (snapshot: OrderbookSnapshot) => {
    const { bids, asks } = snapshot;
    const { baseToken, quoteToken } = this.props;
    bids.forEach(this.addBidToOrderbook);
    asks.forEach(this.addAskToOrderbook);
    if (this.state.loading) {
      this.setState({ loading: false });
    }
  };

  private addAskToOrderbook = (ask: SignedOrder) => {
    const { baseToken, quoteToken } = this.props;
    const orderDetail = this.computeOrderDetails(ask, baseToken.address, quoteToken.address);
    this.addOrderDetails(ask, orderDetail);
    this.addAsk(ask);
  };

  private addBidToOrderbook = (bid: SignedOrder) => {
    const { baseToken, quoteToken } = this.props;
    const orderDetail = this.computeOrderDetails(bid, baseToken.address, quoteToken.address);
    this.addOrderDetails(bid, orderDetail);
    this.addBid(bid);
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

  // b - a
  private sortOrdersAsc = (a: SignedOrder, b: SignedOrder) => {
    if (ZeroEx.getOrderHashHex(a) === ZeroEx.getOrderHashHex(b)) {
      return 0;
    }
    const priceA = this.getPriceForSignedOrder(a);
    const priceB = this.getPriceForSignedOrder(b);
    const priceDif = priceB.sub(priceB);
    if (!priceDif.isZero()) {
      return priceDif.toNumber();
    }
    return -1;
  };

  // a - b
  private sortOrdersDesc = (a: SignedOrder, b: SignedOrder) => {
    return this.sortOrdersAsc(b, a);
  };

  private getMidMarketPrice = (bids: RBTree<SignedOrder>, asks: RBTree<SignedOrder>): BigNumber => {
    // Bids and asks currently exist
    if (bids && bids.size > 0 && asks && asks.size > 0) {
      const currentHighestBid = bids.max(); // highest 'buy'
      const currentLowestAsk = asks.min(); // lowest 'sell'
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

  private RBTreeToArray<T>(tree: RBTree<T>): Array<T> {
    let arr: Array<T> = [];
    tree.each(node => arr.push(node));
    return arr;
  }

  render() {
    console.log(this.state);


    
    const { wsEndpoint, baseToken, quoteToken } = this.props;
    const { loading, asks, bids } = this.state;

    if (!quoteToken || !baseToken) 
    return (
      <Spinner/>
    );

    const asksInOrder = this.RBTreeToArray(asks);
    const bidsInOrder = this.RBTreeToArray(bids);
    const midMarketPrice = this.getMidMarketPrice(bids, asks).toFixed(5);



    return (
      <AppContent>
        <LeftNavContainer>
          <LeftNavHeader>
          </LeftNavHeader>
          <LeftNavSectionContainer>
            <LeftNavSectionTitle>Token Pairs</LeftNavSectionTitle>
            <LeftNavListItem to={'/orderbook/MKR-WETH'} title={'MKR/ETH'} subtitle={'Maker/Ethereum'} />
            <LeftNavListItem to={'/orderbook/ZRX-WETH'} title={'ZRX/ETH'} subtitle={'ZeroEx/Ethereum'} />
            <LeftNavListItem to={'MKR-ETmeowH'} title={'MKR/ETH'} subtitle={'Maker/Ethereum'} />

          </LeftNavSectionContainer>
        </LeftNavContainer>
        <OrderbookContainer>
          <ZeroExFeed
            ref={ref => (this.feed = ref)}
            url={wsEndpoint}
            onMessage={this.handleSocketMessage}
            onOrderbookSnapshot={this.handleOrderbookSnapshot}
            onOrderbookUpdate={this.handleOrderbookUpdate}
            onOrderbookFill={this.handleOrderbookFill}
            onClose={() => {}}
          />
          <MainPanel>
            <ContentHeader>Open Orders</ContentHeader>
            <ContentHeader>{midMarketPrice}</ContentHeader>
            <BidsAndAsksTablesContainer>
              <IndividualTableContainer>
                <TradeTable
                  headerTitle={'Asks'}
                  baseTokenSymbol={baseToken.symbol}
                  quoteTokenSymbol={quoteToken.symbol}
                  data={asksInOrder}
                  loading={loading}
                  noOrdersText={'No asks found'}
                />
              </IndividualTableContainer>
              <IndividualTableContainer>
                <TradeTable
                  headerTitle={'Bids'}
                  baseTokenSymbol={baseToken.symbol}
                  quoteTokenSymbol={quoteToken.symbol}
                  data={bidsInOrder}
                  loading={loading}
                  noOrdersText={'No bids found'}
                />
              </IndividualTableContainer>
            </BidsAndAsksTablesContainer>
          </MainPanel>
          <SidePanelContainer>
            <SidePanelHeader>Recent fills</SidePanelHeader>
            <SidePanel>
              <SidePanelContent>
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>{' '}
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>{' '}
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>{' '}
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>{' '}
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>{' '}
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>{' '}
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>{' '}
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>{' '}
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>{' '}
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>{' '}
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>{' '}
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>{' '}
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>{' '}
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>
                <SidePanelListItem>
                  <SidePanelListItemMaker>1000040 MKR</SidePanelListItemMaker>
                  <SidePanelListItemSwapIcon />
                  <SidePanelListItemTaker>0.1219921 ZRX</SidePanelListItemTaker>
                </SidePanelListItem>
              </SidePanelContent>
            </SidePanel>
          </SidePanelContainer>
        </OrderbookContainer>
      </AppContent>
    );
  }
}

export { TokenPairOrderbook };

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
