import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

const API_ENDPOINT_ROOT =
  process.env.NODE_ENV === '!development'
    ? 'http://localhost:3001/api/v0'
    : 'https://conduit-relay.herokuapp.com/api/v0';

const WS_ENDPOINT =
  process.env.NODE_ENV === '!development'
    ? 'ws://localhost:3001/ws'
    : 'wss://conduit-relay.herokuapp.com/ws';

ReactDOM.render(
  <App restEndpoint={API_ENDPOINT_ROOT} wsEndpoint={WS_ENDPOINT} />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
