import * as React from 'react';
import { Component } from 'react';
import styled from 'styled-components';
import { BigNumber } from 'bignumber.js';
import { ZeroEx, SignedOrder, Token } from '0x.js';
import { RBTree } from 'bintrees';
import { NavLink } from 'react-router-dom';
import { TradeTable } from '../components/TradeTable';
import { ZeroExFeed, OrderbookSnapshot } from '../components/ZeroExFeed';
import { Spinner } from '../components/Spinner';
import {
  LeftNavContainer,
  LeftNavHeader,
  LeftNavHeaderLogo,
  LeftNavHeaderTitle,
  LeftNavSectionContainer,
  LeftNavSectionTitle,
  LeftNavListItem,
} from '../components/NavPanel';
import {
  SidePanelContainer,
  SidePanel,
  SidePanelHeader,
  SidePanelContent,
  SidePanelListItem,
  SidePanelListItemMaker,
  SidePanelListItemTaker,
  SidePanelListItemSwapIcon,
} from '../components/RecentFillsPanel';
import sizing from '../util/sizing';
import colors from '../util/colors';
const logo = require('../assets/icons/conduit-white.svg');

const ContentHeader = styled.h1`
  display: flex;
  flex-direction: row;
  flex: 1;
  flex-shrink: 0;
  flex-basis: 6rem;
  height: 6rem;
  max-height: 6rem;
  align-items: center;
  padding-top: 0;
  font-size: 2rem;
  font-weight: 300;
  letter-spacing: 0.5px;
  color: ${colors.darkBlue};
`;

const BidsAndAsksTablesContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  @media (max-width: ${sizing.mediumMediaQuery}) {
    flex-direction: column;
  }
`;

const AskTableContainer = styled.div`
  position: relative;
  display: flex;
  max-height: 480px;
  flex: 1;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px 0 rgba(36, 48, 86, 0.2);
  @media (min-width: ${sizing.mediumMediaQuery}) {
    margin-right: ${sizing.spacingMedium};
  }
`;

const BidTableContainer = styled.div`
  position: relative;
  display: flex;
  max-height: 480px;
  flex: 1;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px 0 rgba(36, 48, 86, 0.2);
`;

const OrderbookContainer = styled.div`
  display: flex;
  height: 100%;
  flex: 1;
  flex-direction: column;
`;

const HeaderBar = styled.div`
  height: 4rem;
  padding-left: 4rem;
  background: #ffffff;
  display: flex;
  align-items: center;
  @media (max-width: ${sizing.mediumMediaQuery}) {
    padding-left: 2rem;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #33354a;
  letter-spacing: 0;
`;

const AppContent = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
`;

const AllContentBelowHeader = styled.div`
  display: flex;
  flex: 1;
`;

const MainPanel = styled.section`
  display: flex;
  flex: 1;
  flex-basis: 40rem;
  flex-direction: column;
  padding: 0 4rem;
  background-image: linear-gradient(-180deg, #f7f7f8 0%, #ffffff 100%);
  @media (max-width: ${sizing.mediumMediaQuery}) {
    padding: 0 2rem;
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
    if (
      nextProps.baseToken.address !== this.props.baseToken.address ||
      nextProps.quoteToken.address !== this.props.quoteToken.address
    ) {
      console.log('new pair to look at, resetting state');
      this.setState({
        bids: new RBTree<SignedOrder>(this.sortOrdersAsc),
        asks: new RBTree<SignedOrder>(this.sortOrdersDesc),
        orderDetailsMap: new WeakMap<SignedOrder, OrderDetails>(),
        recentFills: [],
        loading: true,
      });
      this.feed &&
        this.feed.subscribeToOrderbook(nextProps.baseToken.address, nextProps.quoteToken.address);
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
    // const { baseToken, quoteToken } = this.props;
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
    const priceDif = priceB.sub(priceA);
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

    if (!quoteToken || !baseToken) return <Spinner />;

    const asksInOrder = this.RBTreeToArray(asks);
    const bidsInOrder = this.RBTreeToArray(bids);
    const midMarketPrice = this.getMidMarketPrice(bids, asks).toFixed(5);

    return (
      <AppContent>
        <ZeroExFeed
          ref={ref => (this.feed = ref)}
          url={wsEndpoint}
          onMessage={this.handleSocketMessage}
          onOrderbookSnapshot={this.handleOrderbookSnapshot}
          onOrderbookUpdate={this.handleOrderbookUpdate}
          onOrderbookFill={this.handleOrderbookFill}
          onClose={() => {}}
        />
        <LeftNavContainer>
          <LeftNavHeader>
            <NavLink to={'/'}>
              <LeftNavHeaderLogo src={logo} />
            </NavLink>
            <NavLink to={'/'}>
              <LeftNavHeaderTitle>Conduit</LeftNavHeaderTitle>
            </NavLink>
          </LeftNavHeader>
          <LeftNavSectionContainer>
            <LeftNavSectionTitle>Token Pairs</LeftNavSectionTitle>
            <LeftNavListItem
              to={'/orderbook/MKR-WETH'}
              title={'MKR/ETH'}
              subtitle={'Maker/Ethereum'}
            />
            <LeftNavListItem
              to={'/orderbook/ZRX-WETH'}
              title={'ZRX/ETH'}
              subtitle={'ZeroEx/Ethereum'}
            />
            <LeftNavListItem
              to={'/orderbook/DOESNOTEXIST'}
              title={'NOPE/ETH'}
              subtitle={'DNE/Ethereum'}
            />
          </LeftNavSectionContainer>
        </LeftNavContainer>
        <OrderbookContainer>
          <HeaderBar>
            <HeaderTitle>Maker / Ethereum</HeaderTitle>
          </HeaderBar>
          <AllContentBelowHeader>
            <MainPanel>
              <ContentHeader>{midMarketPrice}</ContentHeader>
              <BidsAndAsksTablesContainer>
                <AskTableContainer>
                  <TradeTable
                    headerTitle={'Asks'}
                    baseTokenSymbol={baseToken.symbol}
                    quoteTokenSymbol={quoteToken.symbol}
                    data={asksInOrder}
                    loading={loading}
                    noOrdersText={'No asks found'}
                  />
                </AskTableContainer>
                <BidTableContainer>
                  <TradeTable
                    headerTitle={'Bids'}
                    baseTokenSymbol={baseToken.symbol}
                    quoteTokenSymbol={quoteToken.symbol}
                    data={bidsInOrder}
                    loading={loading}
                    noOrdersText={'No bids found'}
                  />
                </BidTableContainer>
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
                </SidePanelContent>
              </SidePanel>
            </SidePanelContainer>
          </AllContentBelowHeader>
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
