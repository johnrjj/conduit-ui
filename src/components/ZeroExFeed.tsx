import { Component } from 'react';
import { SignedOrder } from '0x.js';
import { Client, HttpClient, OrderbookResponse  } from '@0xproject/connect';
// import { OrderbookChannelHandler, OrderbookChannelSubscriptionOpts } from '@0xproject/connect/lib/types';
import { OrderbookChannel, OrderbookChannelSubscriptionOpts, OrderbookChannelHandler } from '@0xproject/connect/lib/src/types';
import { WebSocketOrderbookChannel } from '@0xproject/connect/lib/src/ws_orderbook_channel';


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
  wsEndpoint: string;
  restEndpoint: string;
  onSnapshot: (channel: OrderbookChannel, subscriptionOpts: OrderbookChannelSubscriptionOpts, snapshot: OrderbookResponse) => void;
  onUpdate: (channel: OrderbookChannel, subscriptionOpts: OrderbookChannelSubscriptionOpts,  order: SignedOrder) => void;
  onError: (channel: OrderbookChannel, subscriptionOpts: OrderbookChannelSubscriptionOpts, err: Error) => void;
  onClose: (channel: OrderbookChannel) => void;
}

export class ZeroExFeed extends Component<ZeroExFeedProps> {
  client: Client;
  orderbookChannel: any;

  componentDidMount() {
    this.handleWebSocketSetup();
  }

  compoenntWillReceiveProps() {
    this.handleWebSocketSetup();
  }

  componentWillUnmount() {
    this.orderbookChannel.close();
  }

  render() {
    return null;
  }

  subscribeToOrderbook = (
    options: OrderbookChannelSubscriptionOpts,
    // handler: OrderbookChannelHandler,
  ) => {
    const propsHandler: OrderbookChannelHandler = {
      onSnapshot: this.props.onSnapshot,
      onUpdate: this.props.onUpdate,
      onClose: this.props.onClose,
      onError: this.props.onError,
    }
    this.orderbookChannel.subscribe(options, propsHandler);
  };

  // send(data: any) {
  //   this.waitForConnection(() => this.ws.send(data));
  // }

  // reconnect = () => this.handleWebSocketSetup();

  // handleSocketMessage = (msg: MessageEvent) => {
  //   if (!msg || !msg.data) {
  //     console.log('Recevied empty message from Conduit WebSocket server, returning');
  //     return;
  //   }
  //   try {
  //     const event: RelayerSocketResponse<any> = JSON.parse(msg.data);
  //     switch (event.channel) {
  //       case 'orderbook':
  //         console.log('got an orderbook channel event');
  //         this.handleOrderbookEvent(event);
  //         return;
  //       default:
  //         console.log(
  //           'Unrecognized event channel, only supports orderbook channel right now',
  //           event
  //         );
  //         return;
  //     }
  //   } catch (e) {
  //     console.error('Error parsing event from connected WebSocket', e, msg.data);
  //     throw e;
  //   }
  // };

  // private handleOrderbookEvent(orderbookEvent: RelayerSocketResponse<any>) {
  //   switch (orderbookEvent.type) {
  //     case 'snapshot':
  //       const orderbookSnapshotEvent = orderbookEvent as RelayerSocketResponse<OrderbookSnapshot>;
  //       console.log('got a snapshot orderbook event', orderbookSnapshotEvent);
  //       // const orderbookSnapshot = orderbookSnapshotEvent.payload;
  //       this.props.onOrderbookSnapshot &&
  //         this.props.onOrderbookSnapshot(orderbookSnapshotEvent.payload);
  //       return;
  //     case 'update':
  //       console.log('2');
  //       const orderbookUpdateEvent = orderbookEvent as RelayerSocketResponse<OrderbookUpdate>;
  //       console.log('got a update orderbook event', orderbookEvent, orderbookUpdateEvent);
  //       // const updatedOrder = orderbookUpdateEvent.payload;
  //       this.props.onOrderbookUpdate && this.props.onOrderbookUpdate(orderbookUpdateEvent);
  //       return;
  //     case 'fill':
  //       // remember this is nonstandard api spec
  //       console.log('got a fill orderbook event', orderbookEvent);
  //       // const orderbookFillEvent = orderbookEvent as RelayerSocketResponse<OrderbookFill>;
  //       this.props.onOrderbookFill && this.props.onOrderbookFill(orderbookEvent);
  //       return;
  //     default:
  //       console.log('unrecognized orderbook event', orderbookEvent);
  //       return;
  //   }
  // }

  // waitForConnection = (callback, interval = 1000) => {
  //   this.ws.readyState === this.ws.OPEN
  //     ? callback()
  //     : setTimeout(() => this.waitForConnection(callback, interval), interval); //todo expon retry
  // };

  handleWebSocketSetup = () => {

    this.client = new HttpClient(this.props.restEndpoint);
    this.orderbookChannel = new WebSocketOrderbookChannel(this.props.wsEndpoint);


    };
}
