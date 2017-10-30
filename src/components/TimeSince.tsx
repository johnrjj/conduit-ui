import * as React from 'react';
import { distanceInWordsToNow } from 'date-fns';

export interface TimeSinceProps {
  formatter(s?: string): string;
  date?: Date;
}

interface Fetcher {}

export class TimeSince extends React.Component<TimeSinceProps, any> {
  interval?: number;

  componentDidMount() {
    if (this.props.date) {
      this.trackTimeSince();
    }
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  componentDidUpdate(prevProps: TimeSinceProps) {
    if (this.props.date !== prevProps.date) {
      this.trackTimeSince();
    }
  }

  trackTimeSince() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
    this.interval = window.setInterval(() => this.forceUpdate(), 1000);
  }

  render() {
    const { date } = this.props;
    const text = date
      ? distanceInWordsToNow(date, { includeSeconds: true, addSuffix: true })
      : undefined;

    return <p>{this.props.formatter(text)}</p>;
  }
}
