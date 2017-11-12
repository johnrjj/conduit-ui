import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import { WebSocket, Server, SocketIO } from 'mock-socket';

// declare var mock_socket: any;
global['WebSocket'] = WebSocket;

it('foobar', () => {
  const foo = 1 + 1;
});
// it('renders without crashing', () => {
//   const div = document.createElement('div');
//   ReactDOM.render(<App />, div);
// });
