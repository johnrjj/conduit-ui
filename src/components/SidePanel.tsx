import * as React from 'react';
import styled from 'styled-components';
import colors from '../util/colors';
import sizing from '../util/sizing';

const SidePanel = styled.aside`
  display: flex;
  flex-direction: column;
  flex-basis: 20rem;
  flex-shrink: 2;
  border-left: 1px solid ${colors.greyBorder};
  @media (max-width: ${sizing.smallMediaQuery}) {
    flex-basis: inherit;
  }
`;

const SidePanelHeader = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  padding-left: 1rem;
  color: ${colors.darkGrey};
  height: 4rem;
  align-items: center;
  flex-basis: 4rem;
  max-height: 4rem;
  border-bottom: 1px solid ${colors.greyBorder};
  font-weight: 100;
  background: ${colors.lightGrey};
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
  SidePanel,
  SidePanelHeader,
  SidePanelContent,
  SidePanelListItem,
  SidePanelListItemMaker,
  SidePanelListItemTaker,
  SidePanelListItemSwapIcon,
};
