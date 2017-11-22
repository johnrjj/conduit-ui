import * as React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

const LeftNavContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-basis: 16rem;
  max-width: 16rem;
  min-width: 12rem;
  background-image: linear-gradient(-180deg, #25206b 0%, #5e4da3 80%);
`;

const LeftNavHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  height: 4rem;
  min-height: 4rem;
  padding-bottom: 1rem;
  margin: 0rem 1rem 3rem 20px;
`;

const LeftNavHeaderLogo = styled.img`
  height: 2rem;
  min-height: 2rem;
  width: 2rem;
  margin-right: 0.5rem;
`;

const LeftNavHeaderTitle = styled.h1`
  font-family: Futura;
  font-weight: 500;
  font-size: 1.5rem;
  color: #ffffff;
  letter-spacing: 1px;
`;

const LeftNavSectionContainer = styled.div``;

const LeftNavSectionTitle = styled.div`
  font-size: 1rem;
  color: #9795bb;
  letter-spacing: 0.5px;
  font-weight: 700;
  text-transform: uppercase;
  padding-left: 20px;
  margin-bottom: 1rem;
`;

const activeClassName = 'nav-item-active';
const LeftNavListItemContainer = styled(NavLink).attrs({
  activeClassName,
})`
  height: 72px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 20px;
  opacity: 0.7;
  transition: all 0ms;
  &.${activeClassName} {
    background-image: linear-gradient(90deg, #2d2672 0%, #282268 100%);
    border-left: 4px solid #66609c;
    padding-left: 16px;
    opacity: 1;
    transition: all 300ms;
  }
  :hover {
    opacity: 0.85;
  }
`;

const LeftNavListItemTitle = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
  text-overflow: ellipse;
`;

const LeftNavListItemSubtitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #ada8cd;
  letter-spacing: 0.5px;
  text-overflow: ellipse;
`;

const LeftNavListItem = ({
  title,
  subtitle,
  to,
}: {
  title?: string;
  subtitle?: string;
  to: string;
}) => (
  <LeftNavListItemContainer to={to} activeClassName={activeClassName}>
    <LeftNavListItemTitle>{title}</LeftNavListItemTitle>
    <LeftNavListItemSubtitle>{subtitle}</LeftNavListItemSubtitle>
  </LeftNavListItemContainer>
);

export {
  LeftNavContainer,
  LeftNavHeader,
  LeftNavHeaderLogo,
  LeftNavHeaderTitle,
  LeftNavSectionContainer,
  LeftNavSectionTitle,
  LeftNavListItem,
};
