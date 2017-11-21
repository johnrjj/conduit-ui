import * as React from 'react';
import styled from 'styled-components';
import colors from '../util/colors';
import sizing from '../util/sizing';

const SIDE_PANEL_HEADER_HEIGHT = '4rem';

const SidePanelContainer = styled.aside`
  position: relative;
  display: flex;
  flex-direction: column;
  background-image: linear-gradient(-180deg, #f0f0f1 0%, #ffffff 100%);
  flex-basis: 20rem;
  min-width: 20rem;
  width: 20rem;
  flex-shrink: 2;
  @media (max-width: ${sizing.mediumMediaQuery}) {
    display: none;
  }
`;

const SidePanel = styled.div`
  position: absolute;
  top: ${SIDE_PANEL_HEADER_HEIGHT};
  bottom: 0;
  left: 0;
  right: 0;
  overflow-y: scroll;
`;

const SidePanelHeader = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  align-items: center;
  padding-left: 2rem;
  height: ${SIDE_PANEL_HEADER_HEIGHT};
  align-items: center;
  flex-basis: ${SIDE_PANEL_HEADER_HEIGHT};
  max-height: ${SIDE_PANEL_HEADER_HEIGHT};
  font-size: 24px;
  color: #2d2f41;
  letter-spacing: 0;
  font-weight: 500;
`;

const SidePanelContent = styled.ul`
  display: flex;
  flex-wrap: nowrap;
  flex-direction: column;
  flex: 1;
`;

const SidePanelListItem = styled.li`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 3rem;
  min-height: 3rem;
  font-weight: 100;
  // border-bottom: 1px solid ${colors.greyBorder};
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
