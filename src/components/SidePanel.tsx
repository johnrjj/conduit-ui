import * as React from 'react';
import styled from 'styled-components';
import colors from '../util/colors';
import sizing from '../util/sizing';

const sidePanelHeaderHeight = '4rem';

const SidePanelContainer = styled.aside`
  position: relative;
  display: flex;
  flex-direction: column;
  flex-basis: 20rem;
  flex-shrink: 2;
  border-left: 1px solid ${colors.greyBorder};
  @media (max-width: ${sizing.smallMediaQuery}) {
    display: none;
  }
`;

const SidePanel = styled.div`
  position: absolute;
  top: ${sidePanelHeaderHeight};
  bottom: 0;
  left: 0;
  right: 0;
  overflow: scroll;
`;

const SidePanelHeader = styled.div`
  display: flex;
  position: absolute;
  top: 0; left: 0; right: 0;
  align-items: center;
  font-size: 1.5rem;
  padding-left: 1rem;
  color: ${colors.darkGrey};
  height: ${sidePanelHeaderHeight};
  align-items: center;
  flex-basis: ${sidePanelHeaderHeight};
  max-height: ${sidePanelHeaderHeight};
  border-bottom: 1px solid ${colors.greyBorder};
  font-weight: 100;
  background: ${colors.lightGrey};
`;

const SidePanelContent = styled.div`
  display: flex;
  flex-wrap: nowrap;
  flex-direction: column;
  flex: 1;
  overflow-y: scroll;
  background-image: linear-gradient(-180deg, #f5f7f9 0%, #ffffff 98%);
`;

const SidePanelListItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 3rem;
  min-height: 3rem;
  font-weight: 100;
  background-color: inherit;
  border-bottom: 1px solid ${colors.greyBorder};
`;

const SidePanelListItemMaker = styled.div`
  padding-left: 0rem;
  width: 45%;
  text-align: right;
`;

const SidePanelListItemIconContainer = styled.i`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  width: 10%;
  color: ${colors.darkGrey};
`;

const SidePanelListItemTaker = styled.div`
  width: 45%;
`;

const SidePanelListItemSwapIcon = () => (
  <SidePanelListItemIconContainer className="material-icons">
    swap_horiz
  </SidePanelListItemIconContainer>
);

export {
  SidePanelContainer,
  SidePanel,
  SidePanelHeader,
  SidePanelContent,
  SidePanelListItem,
  SidePanelListItemMaker,
  SidePanelListItemTaker,
  SidePanelListItemSwapIcon,
};
