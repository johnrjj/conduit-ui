import * as React from 'react';
import { Component } from 'react';
import { BigNumber } from 'bignumber.js';
import { Token } from '0x.js';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { TokenSelect } from './pages/TokenSelect';
import { TokenPairOrderbook } from './pages/TokenPairOrderbook';
import { Spinner } from './components/Spinner';
import { enhanceTokenPairData } from './util/token';
import { TokenPairFromApi, FullTokenPairData } from './types';
BigNumber.config({
  EXPONENTIAL_AT: 1000,
});

export interface AppProps {
  restEndpoint: string;
  wsEndpoint: string;
}

export interface AppState {
  tokens: Array<Token>;
  tokenPairs: Array<FullTokenPairData>;
}

class App extends Component<AppProps | any, AppState> {
  constructor(props) {
    super(props);
    this.state = {
      tokens: [],
      tokenPairs: [],
    };
  }

  async componentDidMount() {
    const tokens = await this.fetchTokens();
    const tokenPairs = await this.fetchTokenPairs();
    const fullTokenPairsData = tokenPairs.map(tokenPair => enhanceTokenPairData(tokenPair, tokens));
    this.setState({
      tokens,
      tokenPairs: fullTokenPairsData,
    });
  }

  private fetchTokens = async (): Promise<Array<Token>> => {
    const res = await fetch(`${this.props.restEndpoint}/tokens`);
    const json = res.json();
    return json;
  };

  private fetchTokenPairs = async (): Promise<Array<TokenPairFromApi>> => {
    const res = await fetch(`${this.props.restEndpoint}/token_pairs`);
    const json = res.json();
    return json;
  };

  private getTokenPairFromTicker = (ticker: string) => {
    const tickerParts = ticker.split('-');
    const [baseTokenSymbol, quoteTokenSymbol] = tickerParts;
    if (!baseTokenSymbol || !quoteTokenSymbol) {
      throw new Error('Unrecognized ticker format, must be of format BASESYMBOL-QUOTESYMBOL');
    }
    const tokenPair = this.state.tokenPairs.find(
      tokenPair =>
        tokenPair.baseToken.symbol === baseTokenSymbol &&
        tokenPair.quoteToken.symbol === quoteTokenSymbol
    );
    if (!tokenPair) {
      throw new Error(
        `Could not find token pair ${baseTokenSymbol}-${quoteTokenSymbol} in available token pairs`
      );
    }
    return tokenPair;
  };

  render() {
    const { wsEndpoint } = this.props;
    const { tokenPairs, tokens } = this.state;
    const hasLoadedTokens = tokenPairs.length > 0 && tokens.length > 0;
    if (!hasLoadedTokens) return <Spinner />;
    return (
      <Router>
        <Switch>
          <Route
            path="/orderbook/:tokenPair"
            render={props => {
              const ticker = props.match.params.tokenPair;
              try {
                const tokenPair = this.getTokenPairFromTicker(ticker);
                return (
                  <TokenPairOrderbook
                    selectedTokenPair={tokenPair}
                    availableTokenPairs={tokenPairs}
                    wsEndpoint={wsEndpoint}
                    {...props}
                  />
                );
              } catch (err) {
                // user was linked to a nonexistant token pair
                // todo, redirect to 404 and show human readable error
                console.error(err);
                return <Redirect to={'/'} />;
              }
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

export default App;
