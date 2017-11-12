import * as React from 'react';
import styled from 'styled-components';
import colors from '../util/colors';
import sizing from '../util/sizing';

const AppFooter = styled.footer`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  height: ${sizing.footerHeight};
  width: 100%;
  padding-left: 2rem;
  border-top: 1px solid ${colors.greyWithBlueHue};
  font-weight: 100;
`;

export { AppFooter };
