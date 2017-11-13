import * as React from 'react';
import { Component } from 'react';
import styled from 'styled-components';
import { BigNumber } from 'bignumber.js';
import { ZeroEx, SignedOrder, Token } from '0x.js';
import { RBTree } from 'bintrees';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import { AppContainer, AppContent } from './components/MainLayout';
import { TradeTable } from './components/TradeTable';
import { AppHeader } from './components/Header';
import { Home } from './components/Home';
import { LoadingScreen } from './components/Loading';
import { ConnectionError } from './components/ConnectionError';
import { TokenPairOrderbook } from './components/TokenPairOrderbook';
import { TimeSince } from './components/TimeSince';
import { AppFooter } from './components/Footer';
import { TokenPair } from './types';
const logo = require('./assets/icons/conduit-white.svg');
const exchange = require('./assets/icons/exchange-black.svg');
BigNumber.config({
  EXPONENTIAL_AT: 1000,
});

export interface AppProps {
  restEndpoint: string;
  wsEndpoint: string;
}
export interface AppState {
  connectionStatus: 'connected' | 'disconnected' | 'loading';
  lastWebSocketUpdate?: Date;
  tokens: Array<any>;
  tokenPairs: Array<any>;
}

class App extends Component<AppProps | any, AppState> {
  constructor(props) {
    super(props);
    this.state = {
      connectionStatus: 'loading',
      tokens: [],
      tokenPairs: [],
    };
  }

  async componentDidMount() {
    const tokens = await this.fetchTokens();
    const tokenPairs = await this.fetchTokenPairs();
    this.setState({
      tokens,
      tokenPairs,
    });
    this.setState({ lastWebSocketUpdate: new Date(), connectionStatus: 'connected' });
  }

  private fetchTokens = async (): Promise<Array<Token>> => {
    const res = await fetch(`${this.props.restEndpoint}/tokens`);
    const json = res.json();
    return json;
  };

  private fetchTokenPairs = async (): Promise<Array<TokenPair>> => {
    const res = await fetch(`${this.props.restEndpoint}/token_pairs`);
    const json = res.json();
    return json;
  };

  private getTokenFromSymbol = (symbol: string) => {
    return this.state.tokens.find(t => t.symbol === symbol);
  };

  private getBaseAndQuoteTokenFromTicker = (ticker: string) => {
    const tickerParts = ticker.split('-');
    const [baseTokenSymbol, quoteTokenSymbol] = tickerParts;
    const baseToken = this.getTokenFromSymbol(baseTokenSymbol);
    const quoteToken = this.getTokenFromSymbol(quoteTokenSymbol);
    return {
      baseToken,
      quoteToken,
    };
  };

  render() {
    const { wsEndpoint } = this.props;
    const { lastWebSocketUpdate, connectionStatus, tokenPairs, tokens } = this.state;
    const hasLoadedTokens: boolean = tokenPairs.length > 0 && tokens.length > 0;
    return (
      <Router>
        <AppContainer>
          <AppHeader title={'Conduit'} subtitle={'Open Source 0x Relayer'} logo={logo} />
          {connectionStatus === 'disconnected' ? (
            <ConnectionError />
          ) : !hasLoadedTokens ? (
            <LoadingScreen />
          ) : (
            <AppContent>
              <Switch>
                <Route
                  path="/orderbook/:tokenPair"
                  render={props => {
                    const ticker = props.match.params.tokenPair;
                    const { baseToken, quoteToken } = this.getBaseAndQuoteTokenFromTicker(ticker);
                    return (
                      <TokenPairOrderbook
                        baseToken={baseToken}
                        quoteToken={quoteToken}
                        wsEndpoint={wsEndpoint}
                        {...props}
                      />
                    );
                  }}
                />
                <Route
                  exact
                  path="/"
                  render={props => <Home tokenPairs={tokenPairs} {...props} />}
                />
              </Switch>
            </AppContent>
          )}
          <AppFooter>
            <TimeSince
              date={lastWebSocketUpdate}
              formatter={timeSince => (timeSince ? `Last updated ${timeSince}` : 'Disconnected')}
            />
          </AppFooter>
        </AppContainer>
      </Router>
    );
  }
}

export default App;
