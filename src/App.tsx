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
import { Orderbook } from './components/Orderbook';
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
    const tokens = await this.getTokens();
    const tokenPairs = await this.getTokenPairs();
    this.setState({
      tokens,
      tokenPairs,
    });
    this.setState({ lastWebSocketUpdate: new Date(), connectionStatus: 'connected' });
  }

  private getTokenSymbol(address: string) {
    const token = this.state.tokens.find(x => x.address === address);
    const symbol = token.symbol;
    return symbol;
  }

  private getTokens = async (): Promise<Array<Token>> => {
    const res = await fetch(`${this.props.restEndpoint}/tokens`);
    const json = res.json();
    return json;
  };

  private getTokenPairs = async (): Promise<Array<TokenPair>> => {
    const res = await fetch(`${this.props.restEndpoint}/token_pairs`);
    const json = res.json();
    return json;
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
            <Switch>
              <Route
                path="/orderbook/:token_pair"
                render={props => (
                  <Orderbook
                    tokens={tokens}
                    tokenPairs={tokenPairs}
                    baseTokenAddress={
                      '0x1dad4783cf3fe3085c1426157ab175a6119a04ba' /*props.match['token_pair']*/
                    }
                    quoteTokenAddress={
                      '0x05d090b51c40b020eab3bfcb6a2dff130df22e9c' /*props.match['token_pair']*/
                    }
                    wsEndpoint={wsEndpoint}
                    {...props}
                  />
                )}
              />
              <Route exact path="/" render={props => <Home tokenPairs={tokenPairs} {...props} />} />
            </Switch>
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

// const Child = ({ match }) => (
//   <div>
//     <h3>ID: {match.params.token_pair}</h3>
//   </div>
// );
