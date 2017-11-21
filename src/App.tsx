import * as React from 'react';
import { Component } from 'react';
import { BigNumber } from 'bignumber.js';
import { Token } from '0x.js';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { TokenSelect } from './pages/TokenSelect';
import { TokenPairOrderbook } from './pages/TokenPairOrderbook';
import { Spinner } from './components/Spinner';
import { TokenPair } from './types';
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
  tokens: Array<Token>;
  tokenPairs: Array<TokenPair>;
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

  private getTokenFromSymbol = (symbol: string): Token => {
    const token = this.state.tokens.find(t => t.symbol === symbol);
    if (!token) {
      throw new Error('Token not found');
    }
    return token;
  };

  private getBaseAndQuoteTokenFromTicker = (ticker: string) => {
    const tickerParts = ticker.split('-');
    const [baseTokenSymbol, quoteTokenSymbol] = tickerParts;
    try {
      const baseToken = this.getTokenFromSymbol(baseTokenSymbol);
      const quoteToken = this.getTokenFromSymbol(quoteTokenSymbol);
      return {
        baseToken,
        quoteToken,
      };
    } catch (e) {
      console.error(e);
      return {
        baseToken: null,
        quoteToken: null,
      };
    }
  };

  render() {
    const { wsEndpoint } = this.props;
    const { tokenPairs, tokens } = this.state;
    const hasLoadedTokens: boolean = tokenPairs.length > 0 && tokens.length > 0;

    if (!hasLoadedTokens) return <Spinner />;
    // TODO, if you go directly to the orderbook page it crashes cuz it doesnt wait on hasLoadedTokens
    return (
      <Router>
        <Switch>
          <Route
            path="/orderbook/:tokenPair"
            render={props => {
              const ticker = props.match.params.tokenPair;
              const { baseToken, quoteToken } = this.getBaseAndQuoteTokenFromTicker(ticker);
              if (!baseToken || !quoteToken) {
                return <Redirect to={'/'} />;
              }
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
            render={props => <TokenSelect tokenPairs={tokenPairs} {...props} />}
          />
        </Switch>
      </Router>
    );
  }
}

// const CenterSpinner = styled.div`
//   display: flex;
//   align-items: center;
//   flex: 1;
// `;

export default App;
