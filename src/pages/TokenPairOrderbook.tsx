import * as React from 'react';
import { Component } from 'react';
import styled from 'styled-components';
import { BigNumber } from 'bignumber.js';
import { ZeroEx, SignedOrder } from '0x.js';
import { RBTree } from 'bintrees';
import { NavLink } from 'react-router-dom';
import { TradeTable } from '../components/TradeTable';
import { ZeroExFeed, OrderbookSnapshot } from '../components/ZeroExFeed';
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
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
  SidePanelListItem,
} from '../components/RecentFillsPanel';
import { OrderbookSummary, OrderbookSummaryItem } from '../components/OrderbookSummary';
import sizing from '../util/sizing';
// import colors from '../util/colors';
import { FullTokenPairData, SignedOrderWithMetadata } from '../types';
const logo = require('../assets/icons/conduit-white.svg');

const AppContent = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
`;

const OrderbookHeader = styled.div`
  height: 4rem;
  padding-left: 4rem;
  background: #ffffff;
  display: flex;
  align-items: center;
  @media (max-width: ${sizing.mediumMediaQuery}) {
    padding-left: 2rem;
  }
`;

const OrderbookHeaderTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #33354a;
  letter-spacing: 0;
`;

const OrderbookContent = styled.div`
  display: flex;
  flex: 1;
`;

const ContentPanel = styled.section`
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

export interface OrderbookProps {
  wsEndpoint: string;
  selectedTokenPair: FullTokenPairData;
  availableTokenPairs: Array<FullTokenPairData>;
}

export interface OrderbookState {
  loading: boolean;
  bids: RBTree<SignedOrderWithMetadata>;
  asks: RBTree<SignedOrderWithMetadata>;
  recentFills: Array<any>;
}

class TokenPairOrderbook extends Component<OrderbookProps, OrderbookState> {
  feed: ZeroExFeed | null;
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      bids: new RBTree<SignedOrderWithMetadata>(this.sortOrdersAsc),
      asks: new RBTree<SignedOrderWithMetadata>(this.sortOrdersDesc),
      recentFills: [],
    };
  }

  componentDidMount() {
    this.feed &&
      this.feed.subscribeToOrderbook(
        this.props.selectedTokenPair.baseToken.address,
        this.props.selectedTokenPair.quoteToken.address
      );
  }

  componentWillReceiveProps(nextProps: OrderbookProps) {
    if (
      nextProps.selectedTokenPair.baseToken.address !==
        this.props.selectedTokenPair.baseToken.address ||
      nextProps.selectedTokenPair.quoteToken.address !==
        this.props.selectedTokenPair.quoteToken.address
    ) {
      console.log('new pair to look at, resetting state');
      this.setState({
        bids: new RBTree<SignedOrderWithMetadata>(this.sortOrdersAsc),
        asks: new RBTree<SignedOrderWithMetadata>(this.sortOrdersDesc),
        // orderDetailsMap: new WeakMap<SignedOrder, OrderDetails>(),
        recentFills: [],
        loading: true,
      });
      this.feed &&
        this.feed.subscribeToOrderbook(
          nextProps.selectedTokenPair.baseToken.address,
          nextProps.selectedTokenPair.quoteToken.address
        );
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
    bids.forEach(this.addBidToOrderbook);
    asks.forEach(this.addAskToOrderbook);
    if (this.state.loading) {
      this.setState({ loading: false });
    }
  };

  private addAskToOrderbook = (ask: SignedOrder) => {
    const { baseToken, quoteToken } = this.props.selectedTokenPair;
    const askWithMetadata = this.addMetadataToSignedOrder(
      ask,
      baseToken.address,
      quoteToken.address
    );
    this.addAsk(askWithMetadata);
  };

  private addBidToOrderbook = (bid: SignedOrder) => {
    const { baseToken, quoteToken } = this.props.selectedTokenPair;
    const bidWithMetadata = this.addMetadataToSignedOrder(
      bid,
      baseToken.address,
      quoteToken.address
    );
    this.addBid(bidWithMetadata);
  };

  private addAsk(ask: SignedOrderWithMetadata) {
    this.setState((prevState: OrderbookState) => {
      const { asks } = prevState;
      asks.insert(ask);
      return { asks };
    });
  }

  private addBid(bid: SignedOrderWithMetadata) {
    this.setState((prevState: OrderbookState) => {
      const { bids } = prevState;
      bids.insert(bid);
      return { bids };
    });
  }

  private addMetadataToSignedOrder(
    order: SignedOrder,
    baseTokenAddress: string,
    quoteTokenAddress: string
  ) {
    const makerToken =
      this.props.selectedTokenPair.baseToken.address === order.makerTokenAddress
        ? this.props.selectedTokenPair.baseToken
        : this.props.selectedTokenPair.quoteToken;

    const takerToken =
      this.props.selectedTokenPair.baseToken.address === order.takerTokenAddress
        ? this.props.selectedTokenPair.baseToken
        : this.props.selectedTokenPair.quoteToken;

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
    // how many QUOTE's do I have to spend for one BASE
    // i.e. BTC/USD - how many USD's do I have to spend for one BTC
    // BTC is the base asset, USD is the currency we're quoting the base asset for
    const price: BigNumber = quoteUnitAmount.div(baseUnitAmount);
    return {
      ...order,
      price,
      baseUnitAmount,
      quoteUnitAmount,
    };
  }

  // b - a
  private sortOrdersAsc = (a: SignedOrderWithMetadata, b: SignedOrderWithMetadata) => {
    if (ZeroEx.getOrderHashHex(a) === ZeroEx.getOrderHashHex(b)) {
      return 0;
    }
    const priceA = a.price;
    const priceB = b.price;
    const priceDif = priceA.sub(priceB);
    if (!priceDif.isZero()) {
      return priceDif.toNumber();
    }
    return -1;
  };

  // a - b
  private sortOrdersDesc = (a: SignedOrderWithMetadata, b: SignedOrderWithMetadata) => {
    return this.sortOrdersAsc(b, a);
  };

  private getMidMarketPrice = (
    bids: RBTree<SignedOrderWithMetadata>,
    asks: RBTree<SignedOrderWithMetadata>
  ): BigNumber => {
    // Bids and asks currently exist
    if (bids && bids.size > 0 && asks && asks.size > 0) {
      const currentHighestBid = bids.min(); // note, min heap, min accessor gets highest mid (the way its sorted)
      const currentLowestAsk = asks.min(); // note, min heap, min accessor gets lowest ask (the way its sorted)
      console.log(currentHighestBid.price, currentLowestAsk.price);
      const midMarketPrice = currentHighestBid.price.plus(currentLowestAsk.price).div(2);
      return midMarketPrice;
    }
    // No bids exist, use ask price
    if (asks && asks.size > 0) {
      return asks.min().price;
    }

    if (bids && bids.size > 0) {
      return bids.min().price;
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
    const { wsEndpoint, selectedTokenPair, availableTokenPairs } = this.props;
    const { baseToken: selectedBaseToken, quoteToken: selectedQuoteToken } = selectedTokenPair;
    const { loading, asks, bids } = this.state;

    const asksSorted = this.RBTreeToArray(asks);
    const askPrice = (asksSorted[0] && asksSorted[0].price.toFixed(5)) || 'No asks';

    const bidsSorted = this.RBTreeToArray(bids);
    const bidPrice = (bidsSorted[0] && bidsSorted[0].price.toFixed(5)) || 'No bids';
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
            {availableTokenPairs.map(tokenPair => (
              <LeftNavListItem
                key={tokenPair.symbolTicker}
                to={`/orderbook/${tokenPair.baseToken.symbol}-${tokenPair.quoteToken.symbol}`}
                title={tokenPair.symbolTicker}
                subtitle={tokenPair.nameTicker}
              />
            ))}
          </LeftNavSectionContainer>
        </LeftNavContainer>
        <OrderbookContainer>
          <OrderbookHeader>
            <OrderbookHeaderTitle>{selectedTokenPair.nameTicker}</OrderbookHeaderTitle>
          </OrderbookHeader>
          <OrderbookContent>
            <ContentPanel>
              <OrderbookSummary>
                <OrderbookSummaryItem title={midMarketPrice} subtitle={'Mid Market Price'} />
                <OrderbookSummaryItem title={askPrice} subtitle={'Ask Price'} />
                <OrderbookSummaryItem title={bidPrice} subtitle={'Bid Price'} />
              </OrderbookSummary>
              <BidsAndAsksTablesContainer>
                <AskTableContainer>
                  <TradeTable
                    headerTitle={'Asks'}
                    baseTokenSymbol={selectedBaseToken.symbol}
                    quoteTokenSymbol={selectedQuoteToken.symbol}
                    data={asksSorted}
                    loading={loading}
                    noOrdersText={'No asks found'}
                  />
                </AskTableContainer>
                <BidTableContainer>
                  <TradeTable
                    headerTitle={'Bids'}
                    baseTokenSymbol={selectedBaseToken.symbol}
                    quoteTokenSymbol={selectedQuoteToken.symbol}
                    data={bidsSorted}
                    loading={loading}
                    noOrdersText={'No bids found'}
                  />
                </BidTableContainer>
              </BidsAndAsksTablesContainer>
            </ContentPanel>
            <SidePanel>
              <SidePanelHeader>Recent fills</SidePanelHeader>
              <SidePanelContent>
                <SidePanelListItem>No recent fills</SidePanelListItem>
              </SidePanelContent>
            </SidePanel>
          </OrderbookContent>
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
