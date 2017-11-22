import { Token } from '0x.js';
import { TokenPairFromApi, FullTokenPairData } from '../types';

const destructureTokenPair = (tokenPair: TokenPairFromApi) => {
  const [baseTokenSymbol, quoteTokenSymbol] = Object.keys(tokenPair);
  const values = Object.keys(tokenPair).map(k => tokenPair[k]);
  const [baseTokenData, quoteTokenData] = values;
  const baseToken = {
    symbol: baseTokenSymbol,
    ...baseTokenData,
  };
  const quoteToken = {
    symbol: quoteTokenSymbol,
    ...quoteTokenData,
  };
  return {
    baseToken,
    quoteToken,
  };
};

const enhanceTokenPairData = (
  tokenPair: TokenPairFromApi,
  availableTokens: Array<Token>
): FullTokenPairData => {
  const [baseTokenSymbol, quoteTokenSymbol] = Object.keys(tokenPair);
  const values = Object.keys(tokenPair).map(k => tokenPair[k]);
  const [baseTokenData, quoteTokenData] = values;

  const foundBaseToken = availableTokens.find(x => x.address === baseTokenData.address);
  const foundQuoteToken = availableTokens.find(t => t.address === quoteTokenData.address);

  if (!foundBaseToken || !foundQuoteToken) {
    throw new Error('Could not find token in token repository');
  }

  const baseTokenName = foundBaseToken.name;
  const quoteTokenName = foundQuoteToken.name;

  const baseToken = {
    symbol: baseTokenSymbol,
    name: baseTokenName,
    decimals: foundBaseToken.decimals,
    ...baseTokenData,
  };
  const quoteToken = {
    symbol: quoteTokenSymbol,
    name: quoteTokenName,
    decimals: foundQuoteToken.decimals,
    ...quoteTokenData,
  };

  const symbolTicker = `${baseToken.symbol}/${quoteToken.symbol}`;
  const nameTicker = `${baseToken.name.split(' ')[0]}/${quoteToken.name.split(' ')[0]}`;
  return {
    baseToken,
    quoteToken,
    symbolTicker,
    nameTicker,
  };
};

export { destructureTokenPair, enhanceTokenPairData };
