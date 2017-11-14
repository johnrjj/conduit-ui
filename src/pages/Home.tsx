import * as React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { ContentHeader } from '../components/Common';
import { TokenPair } from '../types';
import colors from '../util/colors';
import sizing from '../util/sizing';

const TokenPairSelectContainer = styled.div`
  margin: 0 ${sizing.spacingLarge};
`;

const TokenPairGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, 17rem);
  grid-gap: ${sizing.spacingMedium};
  justify-items: center;
  // justify-content: space-evenly;
`;

const Card = styled.div`
  display: relative;
  height: 8rem;
  width: 16rem;
  background-color: ${colors.white};
  color: ${colors.darkBlue};
  font-size: 1.5rem;
  border-radius: 0.5rem;
  overflow: hidden;
  padding: 1rem 0;
  cursor: pointer;
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
  :hover {
    transform: translateY(-1px);
    box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
  }
  :active {
    transform: translateY(1px);
    box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
  }
`;

const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  height: 100%;
`;

const destructureTokenPair = (tokenPair: TokenPair) => {
  const [baseTokenSymbol, quoteTokenSymbol] = Object.keys(tokenPair);
  const [baseTokenData, quoteTokenData] = Object.values(tokenPair);
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

const computeTokenPairTicker = (tokenPair: TokenPair) => {
  const [baseTokenSymbol, quoteTokenSymbol] = Object.keys(tokenPair);
  return `${baseTokenSymbol}/${quoteTokenSymbol}`;
};

const TokenPairSelect = ({ tokenPair }: { tokenPair: TokenPair }) => {
  const { baseToken, quoteToken } = destructureTokenPair(tokenPair);
  const ticker = computeTokenPairTicker(tokenPair);
  return (
    <Link to={`orderbook/${baseToken.symbol}-${quoteToken.symbol}`}>
      <Card>
        <FlexContainer>{ticker}</FlexContainer>
      </Card>
    </Link>
  );
};

const Home = ({ tokenPairs }: { tokenPairs: Array<TokenPair> }) => (
  <TokenPairSelectContainer>
    <ContentHeader>Select a token pair</ContentHeader>
    <TokenPairGrid>
      {tokenPairs.map(tokenPair => (
        <TokenPairSelect tokenPair={tokenPair} key={computeTokenPairTicker(tokenPair)} />
      ))}
    </TokenPairGrid>
  </TokenPairSelectContainer>
);

export { Home };
