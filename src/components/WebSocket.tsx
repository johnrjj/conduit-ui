import { Component } from 'react';

export interface WSProps {
  url: string;
  onOpen?(e: Event): any;
  onMessage?(me: MessageEvent): any;
  onClose?(ce: CloseEvent): any;
  onError?(e: Event): any;
}

export interface WSState {
  ws: WebSocket;
}

export class WS extends Component<WSProps, WSState> {
  componentDidMount() {
    this.handleWebSocketSetup();
  }

  componentWillUnmount() {
    this.state.ws.close();
  }

  render() {
    return null;
  }

  send = (data: any) => this.state.ws.send(data);

  reconnect = () => this.handleWebSocketSetup();

  private handleWebSocketSetup() {
    const ws = new WebSocket(this.props.url);
    ws.onopen = event => this.props.onOpen && this.props.onOpen(event);
    ws.onmessage = event => this.props.onMessage && this.props.onMessage(event);
    ws.onerror = error => this.props.onError && this.props.onError(error);
    ws.onclose = close => this.props.onClose && this.props.onClose(close);
    this.setState({ ws });
  }
}
