import * as React from 'react';
import styled from 'styled-components';
import colors from '../util/colors';
import sizing from '../util/sizing';

const AppContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 100%;
`;

const AppContent = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
`;

const MainPanel = styled.div`
  display: flex;
  flex: 1;
  flex-basis: 40rem;
  flex-direction: column;
  margin: 0 3rem 0 4rem; // 3rem on right for temp gutter fix
  @media (max-width: ${sizing.mediumMediaQuery}) {
    margin: 0 4rem 0 4rem;
  }
  @media (max-width: ${sizing.smallMediaQuery}) {
    margin: 0 2rem 0 2rem;
  }
`;

const ContentHeader = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  align-items: center;
  font-size: 2rem;
  color: ${colors.darkBlue};
  height: 6rem;
  flex-basis: 6rem;
  max-height: 6rem;
  padding-top: 0rem;
  font-weight: 100;
  letter-spacing: 0.5px;
  background: #ffffff;
`;

export { AppContainer, AppContent, MainPanel, ContentHeader };
