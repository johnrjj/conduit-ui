import * as React from 'react';
import { Component } from 'react';
import styled from 'styled-components';
import { BigNumber } from 'bignumber.js';
import { ZeroEx } from '0x.js';
import { RBTree } from 'bintrees';
import { subHours, subMinutes, subDays } from 'date-fns';
import { AppContainer, AppContent, MainPanel, ContentHeader } from './components/MainLayout';
import { TradeTable, TableFlexGrow } from './components/TradeTable';
import { AppHeader } from './components/Header';
import { ZeroExFeed } from './components/ZeroExFeed';
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

ZeroEx.toBaseUnitAmount(new BigNumber(1212), 18);
ZeroEx.toUnitAmount(new BigNumber('12121212'), 18);

const data = [
  {
    index: 0,
    maker: ZeroEx.toUnitAmount(new BigNumber(10000000000000000000000), 18).toString(),
    taker: ZeroEx.toBaseUnitAmount(new BigNumber(1000), 18).toString(),
    exchange: '1 ZRX / 1.3 MKR',
    date: dateTenMinutesAgo,
  },
  {
    index: 1,
    maker: '1 WETH',
    taker: '10.00000 DGB',
    exchange: '1 WETH / 10 DGB',
    date: dateFiveHoursAgo,
  },
  {
    index: 2,
    maker: '7.14 ZRX',
    taker: '10.100 MKR',
    exchange: '1 ZRX / 1.3 MKR',
    date: dateTwoDaysAgo,
  },
];

// https://dribbble.com/shots/3907247-CL-Overview-UI
// https://dribbble.com/shots/3914200-Web-operation-steps

const API_ENDPOINT_ROOT =
  process.env.NODE_ENV === '!development'
    ? 'http://localhost:3001/api/v0'
    : 'https://conduit-relay.herokuapp.com/api/v0';

const WS_ENDPOINT =
  process.env.NODE_ENV === '!development'
    ? 'ws://localhost:3001/ws'
    : 'wss://conduit-relay.herokuapp.com/ws';

const tokenPairToWatch = {
  baseToken: '0x05d090b51c40b020eab3bfcb6a2dff130df22e9c',
  quoteToken: '0x1dad4783cf3fe3085c1426157ab175a6119a04ba',
};

const getTokens = async () => {
  const res = await fetch(`${API_ENDPOINT_ROOT}/tokens`);
  const json = res.json();
  return json;
};

const getTokenPairs = async () => {
  const res = await fetch(`${API_ENDPOINT_ROOT}/token_pairs`);
  const json = res.json();
  return json;
};

export interface AppProps {}
export interface AppState {
  connectionStatus: 'connected' | 'disconnected' | 'loading';
  lastWebSocketUpdate?: Date;
  bids: RBTree<any>;
  asks: RBTree<any>;
  recentFills: Array<any>;
  tokens: Array<any>;
  tokenPairs: Array<any>;
}

ZeroEx.toBaseUnitAmount(new BigNumber(1212), 18);
ZeroEx.toUnitAmount(new BigNumber('12121212'), 18);

class App extends Component<AppProps, AppState> {
  feed: ZeroExFeed | null;
  constructor() {
    super();
    this.state = {
      connectionStatus: 'loading',
      bids: new RBTree((a, b) => 1),
      asks: new RBTree((a, b) => -1),
      recentFills: [],
      tokens: [],
      tokenPairs: [],
    };
  }

  async componentDidMount() {
    await this.loadTokensAndTokenPairs();
  }

  async loadTokensAndTokenPairs() {
    const tokens = await getTokenPairs();
    const tokenPairs = await getTokens();
    this.setState({
      tokens,
      tokenPairs,
    });
  }

  handleSocketOpen = () => {
    this.setState({ lastWebSocketUpdate: new Date(), connectionStatus: 'connected' });
    console.log('ws open');
    // this.subscribeToRelayerWebSocketFeed(tokenPairToWatch.baseToken, tokenPairToWatch.quoteToken);
  };

  handleSocketMessage = (msg: MessageEvent) => {
    this.setState({ lastWebSocketUpdate: new Date() });
    console.log('Received message from Conduit WebSocket server', msg.data);
  };

  handleSocketClose = () => {
    this.setState({ lastWebSocketUpdate: undefined, connectionStatus: 'disconnected' });
    console.log('close');
  };

  handleSocketError = (err: any) => {
    console.error('Error with relay websocket', err);
  };

  handleOrderbookUpdate(orderbookUpdate) {
    console.log(orderbookUpdate);
    // const newOrder = orderbookEvent.payload;
    // this.setState((prevState) => ({
    //     orders: [...prevState.orders, newOrder]
    //   })
    // );
  }

  handleOrderbookSnapshot(snapshot) {
    console.log(snapshot);
  }

  handleOrderbookFill(fill) {
    console.log(fill);
  }

  render() {
    const { lastWebSocketUpdate, connectionStatus } = this.state;
    return (
      <AppContainer>
        <ZeroExFeed
          ref={ref => (this.feed = ref)}
          url={WS_ENDPOINT}
          onOpen={this.handleSocketOpen}
          onMessage={this.handleSocketMessage}
          onClose={this.handleSocketClose}
          onError={this.handleSocketError}
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
              <TableFlexGrow>
                <TradeTable data={data} />
              </TableFlexGrow>
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
