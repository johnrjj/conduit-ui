import * as React from 'react';
import styled from 'styled-components';
import colors from '../util/colors';

const CenterHorizontallyAndVertically = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 4rem;
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
