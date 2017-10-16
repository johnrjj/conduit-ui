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
import { LoadingPlaceholder } from './components/Loading';
import { distanceInWordsToNow } from 'date-fns';
import 'react-virtualized/styles.css';
import 'react-vis/dist/style.css';
const logo = require('./assets/icons/conduit-white.svg');
const exchange = require('./assets/icons/exchange-black.svg');

const WS_ENDPOINT = 'ws://localhost:3001/ws';

export interface AppProps {}
export interface AppState {
  ws: WebSocket;
  lastUpdated?: Date;
  time?: number;
}

class App extends React.Component<AppProps, AppState> {
  interval: number;
  constructor() {
    super();
    this.state = {
      ws: new WebSocket(WS_ENDPOINT),
    };
  }

  componentDidMount() {
    this.setupWebsocket();
    this.interval = window.setInterval(() => this.setState({ time: Date.now() }), 1000);
  }

  componentWillUnmount() {
    const websocket = this.state.ws;
    websocket.close();
    clearInterval(this.interval);
  }

  private setupWebsocket() {
    const websocket = this.state.ws;
    websocket.onopen = () => {
      this.setState({ lastUpdated: new Date() });
      console.log('opened');
    };
    websocket.onmessage = evt => {
      console.log('msg', evt);
    };
    websocket.onclose = () => {
      console.log('ws closed');
    };
  }

  private isWebSocketClosed() {
    return this.state.ws.readyState === this.state.ws.CLOSED;
  }
  private isWebSocketConnecting() {
    return this.state.ws.readyState === this.state.ws.CONNECTING;
  }
  private isWebSocketOpen() {
    return this.state.ws.readyState === this.state.ws.OPEN;
  }

  render() {
    const lastUpdate =
      (this.state.lastUpdated &&
        distanceInWordsToNow(this.state.lastUpdated, { includeSeconds: true, addSuffix: true })) ||
      'never';
    return (
      <AppContainer>
        <AppHeader title={'Conduit'} subtitle={'Open Source 0x Relayer'} logo={logo} />
        {this.isWebSocketConnecting() ? (
          <LoadingPlaceholder>Loading...</LoadingPlaceholder>
        ) : this.isWebSocketClosed() ? (
          <ConnectionError />
        ) : this.isWebSocketOpen() ? (
          <AppContent>
            <MainPanel>
              <ContentHeader>Open Orders</ContentHeader>
              <TableFlexGrow>
                <TradeTable />
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
        ) : null}
        <AppFooter>
          <p>{`Last updated ${lastUpdate}.`}</p>
        </AppFooter>
      </AppContainer>
    );
  }
}

export default App;
