import * as React from 'react';
import styled from 'styled-components';
import colors from '../util/colors';
import sizing from '../util/sizing';

const ContentHeader = styled.h1`
  display: flex;
  flex-direction: row;
  flex: 1;
  align-items: center;
  color: ${colors.darkBlue};
  height: 6rem;
  flex-basis: 6rem;
  max-height: 6rem;
  padding-top: 0;
  font-size: 2rem;
  font-weight: 300;
  letter-spacing: 0.5px;
`;

export { ContentHeader };
