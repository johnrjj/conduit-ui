import * as React from 'react';
import styled from 'styled-components';
import colors from '../util/colors';

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  flex-basis: 20rem;
  flex-shrink: 2;
  min-width: 12rem;
  max-width: 20rem;
  border-left: 1px solid ${colors.greyWithBlueHue};
`;

const SidePanelHeader = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  padding-left: 1rem;
  color: #6b7c93;
  height: 4rem;
  align-items: center;
  flex-basis: 4rem;
  max-height: 4rem;
  border-bottom: 1px solid ${colors.greyWithBlueHue};
  font-weight: 100;
  background: #e6ebf1;
`;

const SidePanelContent = styled.div`
  display: flex;
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
  font-weight: 100;
  background-color: inherit;
  border-bottom: 1px solid ${colors.greyWithBlueHue};
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
  SidePanel,
  SidePanelHeader,
  SidePanelContent,
  SidePanelListItem,
  SidePanelListItemMaker,
  SidePanelListItemTaker,
  SidePanelListItemSwapIcon,
};
