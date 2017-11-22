import * as React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FullTokenPairData } from '../types';
// import colors from '../util/colors';
// import sizing from '../util/sizing';
const logo = require('../assets/icons/conduit-white.svg');

const FullScreen = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  overflow-y: scroll;
  background-image: linear-gradient(-180deg, #25206b 0%, #5e4da3 99%);
`;

const Logo = styled.img`
  height: 4rem;
  min-height: 4rem;
  width: 4rem;
  margin: 1rem auto 0 auto;
`;

const ShrinkingTopSpacer = styled.div`
  display: flex;
  flex-shrink: 1;
  flex-basis: 7rem;
  max-width: 7rem;
`;

const TitleText = styled.h1`
  color: #ffffff;
  font-size: 4rem;
  text-align: center;
  letter-spacing: 1px;
  margin-bottom: 1rem;
`;

const SubtitleText = styled.p`
  color: #b6b1d3;
  font-size: 1rem;
  text-align: center;
  letter-spacing: 0.5px;
  margin-bottom: 6rem;
`;

const ActionText = styled.h2`
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 300;
  font-family: Open Sans;
  text-align: center;
  margin-bottom: 2rem;
`;

const TokenPairGrid = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  display: grid;
  grid-template-columns: repeat(auto-fit, 17rem);
  grid-gap: 0.5rem;
  justify-items: center;
  justify-content: space-evenly;
  padding: 0 2rem;
  margin-bottom: 2rem;
`;

const TokenPairCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 8rem;
  width: 16rem;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  padding: 1rem 0;
  margin-bottom: 0.5rem;
  cursor: pointer;
  box-shadow: 0 7px 14px #2b2571, 0 3px 6px rgba(0, 0, 0, 0.5);
  :hover {
    transform: translateY(-1px);
    box-shadow: 0 7px 14px #2b2571, 0 3px 6px rgba(0, 0, 0, 0.5);
  }
  :active {
    transform: translateY(1px);
    box-shadow: 0 4px 6px #2b2571, 0 1px 3px rgba(0, 0, 0, 0.5);
  }
`;

const TokenSymbolTicker = styled.p`
  color: #33364a;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const TokenNameTicker = styled.p`
  color: rgba(51, 54, 73, 0.55);
  font-size: 1rem;
`;

// const destructureTokenPair = (tokenPair: TokenPairFromApi) => {
//   const [baseTokenSymbol, quoteTokenSymbol] = Object.keys(tokenPair);
//   const values = Object.keys(tokenPair).map(k => tokenPair[k]);
//   const [baseTokenData, quoteTokenData] = values;
//   const baseToken = {
//     symbol: baseTokenSymbol,
//     ...baseTokenData,
//   };
//   const quoteToken = {
//     symbol: quoteTokenSymbol,
//     ...quoteTokenData,
//   };
//   return {
//     baseToken,
//     quoteToken,
//   };
// };

// const getTokenPairTicker = (tokenPair: TokenPairFromApi) => {
//   const [baseTokenSymbol, quoteTokenSymbol] = Object.keys(tokenPair);
//   return `${baseTokenSymbol}/${quoteTokenSymbol}`;
// };

const TokenPairSelect = ({ tokenPair }: { tokenPair: FullTokenPairData }) => {
  const { baseToken, quoteToken, nameTicker, symbolTicker } = tokenPair;
  return (
    <Link to={`orderbook/${baseToken.symbol}-${quoteToken.symbol}`}>
      <TokenPairCard>
        <TokenSymbolTicker>{symbolTicker}</TokenSymbolTicker>
        <TokenNameTicker>{nameTicker}</TokenNameTicker>
      </TokenPairCard>
    </Link>
  );
};

const TokenSelect = ({ tokenPairs }: { tokenPairs: Array<FullTokenPairData> }) => (
  <FullScreen>
    <ShrinkingTopSpacer />
    <Logo src={logo} />
    <TitleText>Conduit</TitleText>
    <SubtitleText>0x Open Source Relayer</SubtitleText>
    <ActionText>Select a token pair</ActionText>
    <TokenPairGrid>
      {tokenPairs.map(tokenPair => (
        <TokenPairSelect tokenPair={tokenPair} key={tokenPair.symbolTicker} />
      ))}
    </TokenPairGrid>
  </FullScreen>
);

export { TokenSelect };
