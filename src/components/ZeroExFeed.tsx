import * as React from 'react';
import { Component } from 'react';
import { ZeroEx, SignedOrder } from '0x.js';

export type OrderbookUpdate = SignedOrder;

export interface OrderbookSnapshot {
  bids: Array<SignedOrder>;
  asks: Array<SignedOrder>;
}

export interface OrderbookFill {
  test: string;
}

export interface RelayerSocketResponse<
  T extends OrderbookSnapshot | OrderbookUpdate | OrderbookFill
> {
  type: string;
  channel: string;
  channelId: number;
  payload: T;
}

export interface ZeroExFeedProps {
  url: string;
  onOpen?(e: Event): void;
  onMessage?(me: MessageEvent): void;
  onClose?(ce: CloseEvent): void;
  onError?(e: Event): void;
  onOrderbookSnapshot(snapshot: OrderbookSnapshot): void;
  onOrderbookUpdate(update: RelayerSocketResponse<OrderbookUpdate>): void;
  onOrderbookFill(fill: RelayerSocketResponse<any>): void;
}

export interface ZeroExFeedState {
  ws: WebSocket;
}

export class ZeroExFeed extends Component<ZeroExFeedProps, ZeroExFeedState> {
  componentDidMount() {
    this.handleWebSocketSetup();
  }

  componentWillUnmount() {
    this.state.ws.close();
  }

  render() {
    return null;
  }

  subscribeToOrderbook(
    baseTokenAddress: string,
    quoteTokenAddress: string,
    snapshot = true,
    limit = 100
  ) {
    this.send(
      JSON.stringify({
        channel: 'orderbook',
        type: 'subscribe',
        payload: {
          baseTokenAddress,
          quoteTokenAddress,
          snapshot,
          limit,
        },
      })
    );
  }

  send = (data: any) => this.waitForConnection(() => this.state.ws.send(data));

  reconnect = () => this.handleWebSocketSetup();

  handleSocketMessage = (msg: MessageEvent) => {
    if (!msg || !msg.data) {
      console.log('Recevied empty message from Conduit WebSocket server, returning');
      return;
    }
    try {
      const event: RelayerSocketResponse<any> = JSON.parse(msg.data);
      switch (event.channel) {
        case 'orderbook':
          console.log('got an orderbook channel event');
          this.handleOrderbookEvent(event);
          return;
        default:
          console.log(
            'Unrecognized event channel, only supports orderbook channel right now',
            event
          );
          return;
      }
    } catch (e) {
      console.error('Error parsing event from connected WebSocket', e, msg.data);
      throw e;
    }
  };

  private handleOrderbookEvent(orderbookEvent: RelayerSocketResponse<any>) {
    switch (orderbookEvent.type) {
      case 'snapshot':
        const orderbookSnapshotEvent = orderbookEvent as RelayerSocketResponse<OrderbookSnapshot>;
        console.log('got a snapshot orderbook event', orderbookSnapshotEvent);
        const orderbookSnapshot = orderbookSnapshotEvent.payload;
        this.props.onOrderbookSnapshot &&
          this.props.onOrderbookSnapshot(orderbookSnapshotEvent.payload);
        return;
      case 'update':
        console.log('2');
        const orderbookUpdateEvent = orderbookEvent as RelayerSocketResponse<OrderbookUpdate>;
        console.log('got a update orderbook event', orderbookEvent, orderbookUpdateEvent);
        const updatedOrder = orderbookUpdateEvent.payload;
        this.props.onOrderbookUpdate && this.props.onOrderbookUpdate(orderbookUpdateEvent);
        return;
      case 'fill':
        // remember this is nonstandard api spec
        console.log('got a fill orderbook event', orderbookEvent);
        const orderbookFillEvent = orderbookEvent as RelayerSocketResponse<OrderbookFill>;
        this.props.onOrderbookFill && this.props.onOrderbookFill(orderbookEvent);
        return;
      default:
        console.log('unrecognized orderbook event', orderbookEvent);
        return;
    }
  }

  private waitForConnection(callback, interval = 1000) {
    this.state.ws.readyState === this.state.ws.OPEN
      ? callback()
      : setTimeout(() => this.waitForConnection(callback, interval), interval); //todo expon retry
  }

  private handleWebSocketSetup() {
    const ws = new WebSocket(this.props.url);
    ws.onopen = event => this.props.onOpen && this.props.onOpen(event);
    ws.onmessage = event =>
      this.handleSocketMessage(event) || (this.props.onMessage && this.props.onMessage(event));
    ws.onerror = error => this.props.onError && this.props.onError(error);
    ws.onclose = close => this.props.onClose && this.props.onClose(close);
    this.setState({ ws });
  }
}
