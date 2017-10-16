import styled from 'styled-components';
import * as React from 'react';
import colors from '../util/colors';

const CenterHorizAndVert = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 4rem;
`;

const DisconnectedIcon = styled.i`
  font-size: 4.5rem;
  margin: 1rem;
  color: ${colors.darkGrey};
`;

const DisconnectedTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0 0 1rem;
  text-align: center;
  color: ${colors.darkGrey};
`;

const DisconnectedDescription = styled.p`
  font-size: 1.25rem;
  font-weight: 300;
  font-family: 'Roboto Mono';
  text-align: center;
  margin: 0 0 0.5rem;
  padding-bottom: 0;
  color: ${colors.darkGrey};
`;

const ConnectionError = () => (
  <CenterHorizAndVert>
    <DisconnectedIcon className="material-icons">error_outline</DisconnectedIcon>
    <DisconnectedTitle>Conduit not connected</DisconnectedTitle>
    <DisconnectedDescription>No live connection to a Conduit detected</DisconnectedDescription>
    <DisconnectedDescription>
      Make sure your Conduit server is running and the UI is pointed at the right endpoint
    </DisconnectedDescription>
  </CenterHorizAndVert>
);

export { ConnectionError };
