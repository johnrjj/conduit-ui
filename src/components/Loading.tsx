import * as React from 'react';
import styled from 'styled-components';
import colors from '../util/colors';
import sizing from '../util/sizing';

const CenterHorizontallyAndVertically = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: ${sizing.spacingLarge};
`;

const LoadingTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0 0 1rem;
  text-align: center;
  color: ${colors.darkGrey};
`;

const LoadingScreen = () => (
  <CenterHorizontallyAndVertically>
    <LoadingTitle>Connecting...</LoadingTitle>
  </CenterHorizontallyAndVertically>
);

export { LoadingScreen };
