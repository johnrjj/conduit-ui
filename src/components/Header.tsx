import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import sizing from '../util/sizing';

const HeaderContainer = styled.header`
  display: flex;
  flex-display: row;
  align-items: center;
  justify-content: flex-start;
  height: ${sizing.headerHeight};
  min-height: ${sizing.headerHeight};
  padding-left: ${sizing.spacingLarge};
  background-image: linear-gradient(90deg, #4ba1f8 22%, rgba(141, 68, 247, 0.97) 100%);
  @media (max-width: ${sizing.smallMediaQuery}) {
    padding-left: ${sizing.spacingSmall};
  }
`;

const HeaderLogo = styled.img`
  height: 3rem;
  width: 3rem;
  margin-top: 5px;
`;

const HeaderTitle = styled.div`
  margin-left: 1rem;
  color: #feffff;
  font-family: Roboto;
  font-weight: 500;
  letter-spacing: 2px;
  font-size: 1.2rem;
`;

const HeaderSubtitle = styled.div`
  margin-left: 1.1rem;
  font-family: Roboto Mono;
  color: #feffff;
  font-size: 0.8rem;
`;

const HeaderDescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
`;

// const FilledButton = styled.button`
//   background-image: linear-gradient(-90deg, #83dba8 0%, rgba(34, 178, 95, 0.87) 96%);
//   box-shadow: 0 2px 4px 0 rgba(24, 93, 51, 0.9);
// `;

const AppHeader = ({ logo, title, subtitle }: any) => (
  <HeaderContainer>
    <Link to="/">
      <HeaderLogo src={logo} alt="Conduit 0x Relayer Logo" />
    </Link>
    <HeaderDescriptionContainer>
      <HeaderTitle>{title}</HeaderTitle>
      {subtitle && <HeaderSubtitle>{subtitle}</HeaderSubtitle>}
    </HeaderDescriptionContainer>
  </HeaderContainer>
);

export { AppHeader };
