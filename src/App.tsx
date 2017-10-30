import * as React from 'react';
import styled from 'styled-components';
import { AppContainer, AppContent, MainPanel, ContentHeader } from './components/MainLayout';
import { TradeTable, TableFlexGrow } from './components/TradeTable';
import { AppHeader } from './components/Header';
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
import 'react-virtualized/styles.css';
import 'react-vis/dist/style.css';
const logo = require('./assets/icons/conduit-white.svg');
const exchange = require('./assets/icons/exchange-black.svg');

const API_ENDPOINT_ROOT =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001/api/v0'
    : 'https://0x-relayer-api.now.sh/api/v0';

const WS_ENDPOINT =
  process.env.NODE_ENV === 'development'
    ? 'ws://localhost:3001/ws'
    : 'wss://0x-relayer-api.now.sh/ws';

const tokenPairToWatch = {
  baseToken: '0x05d090b51c40b020eab3bfcb6a2dff130df22e9c',
  quoteToken: '0x1dad4783cf3fe3085c1426157ab175a6119a04ba',
};

export interface AppProps {}
export interface AppState {
  lastUpdated?: Date;
  orders: Array<any>;
  recentFills: Array<any>;
  connectionStatus: 'connected' | 'disconnected' | 'loading';
}

class App extends React.Component<AppProps, AppState> {
  interval: number;
  ws: WS | null;
  constructor() {
    super();
    this.state = {
      orders: [],
      recentFills: [],
      connectionStatus: 'loading',
    };
    this.handleSocketOpen = this.handleSocketOpen.bind(this);
    this.handleSocketMessage = this.handleSocketMessage.bind(this);
    this.handleSocketError = this.handleSocketError.bind(this);
    this.handleSocketClose = this.handleSocketClose.bind(this);
  }

  handleSocketOpen() {
    this.subscribeToRelayerWebSocketFeed(tokenPairToWatch.baseToken, tokenPairToWatch.quoteToken);
    this.setState({ lastUpdated: new Date(), connectionStatus: 'connected' });
    console.log('open');
  }

  handleSocketMessage(msg: MessageEvent) {
    this.setState({ lastUpdated: new Date() });
    console.log(msg.data);

    console.log(JSON.parse(msg.data));
  }

  handleSocketClose() {
    this.setState({ lastUpdated: undefined, connectionStatus: 'disconnected' });
    console.log('close');
  }

  handleSocketError(err: any) {
    console.error('Error with relay websocket', err);
    console.log('error');
  }

  render() {
    const { lastUpdated, connectionStatus } = this.state;
    // const signedOrders = orders.map(o => o.signedOrder);
    // const lastUpdate =
    //   (this.state.lastUpdated &&
    //     distanceInWordsToNow(this.state.lastUpdated, { includeSeconds: true, addSuffix: true })) ||
    //   'never';
    return (
      <AppContainer>
        <WS
          ref={ref => {
            this.ws = ref;
          }}
          url={WS_ENDPOINT}
          onOpen={this.handleSocketOpen}
          onMessage={this.handleSocketMessage}
          onClose={this.handleSocketClose}
          onError={this.handleSocketError}
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
                <TradeTable data={null} />
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
            date={lastUpdated}
            formatter={timeSince => (timeSince ? `Last updated ${timeSince}` : 'Disconnected')}
          />
        </AppFooter>
      </AppContainer>
    );
  }

  private subscribeToRelayerWebSocketFeed(
    baseTokenAddress: string,
    quoteTokenAddress: string,
    snapshot = true,
    limit = 100
  ) {
    if (!this.ws) {
      return;
    }
    this.ws.send(
      JSON.stringify({
        channel: 'orderbook',
        type: 'subscribe',
        payload: {
          baseTokenAddress,
          quoteTokenAddress,
          snapshot,
          limit,
        },
      })
    );
  }
}

export default App;

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
