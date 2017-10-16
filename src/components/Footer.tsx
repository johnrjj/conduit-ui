import styled from 'styled-components';
import * as React from 'react';
import colors from '../util/colors';

const AppFooter = styled.div`
  display: flex;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  height: 3.5rem;
  flex-basis: 3.5rem;
  padding-left: 2rem;
  border-top: 1px solid ${colors.greyWithBlueHue};
  font-weight: 100;
`;

export { AppFooter };
