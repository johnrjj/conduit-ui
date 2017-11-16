import * as React from 'react';
import styled from 'styled-components';
import colors from '../util/colors';
import sizing from '../util/sizing';

const AppContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 100%;
  height: 100%;
`;

const AppContent = styled.div`
  display: flex;
  flex: 1;
`;

const MainPanel = styled.section`
  display: flex;
  flex: 1;
  flex-basis: 40rem;
  flex-direction: column;
  margin: 0 3rem 0 ${sizing.spacingLarge}; // 3rem on right for temp gutter fix
  @media (max-width: ${sizing.mediumMediaQuery}) {
    margin: 0 ${sizing.spacingMedium};
  }
  @media (max-width: ${sizing.smallMediaQuery}) {
    margin: 0 ${sizing.spacingSmall};
  }
`;

export { AppContainer, AppContent, MainPanel };
