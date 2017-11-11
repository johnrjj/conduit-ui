import * as React from 'react';
import { distanceInWordsToNow } from 'date-fns';

export interface TimeSinceProps {
  formatter(s?: string): string;
  date?: Date;
}

export class TimeSince extends React.Component<TimeSinceProps, any> {
  private interval?: number;

  componentDidMount() {
    if (this.props.date) {
      this.trackTimeSince();
    }
  }

  componentWillUnmount() {
    this.clearIntervalIfSet();
  }

  componentDidUpdate(prevProps: TimeSinceProps) {
    if (this.props.date !== prevProps.date) {
      this.trackTimeSince();
    }
  }

  render() {
    const { date } = this.props;
    const text = date
      ? distanceInWordsToNow(date, { includeSeconds: true, addSuffix: true })
      : undefined;

    return <p>{this.props.formatter(text)}</p>;
  }

  private trackTimeSince() {
    this.clearIntervalIfSet();
    this.interval = window.setInterval(() => this.forceUpdate(), 1000);
  }

  private clearIntervalIfSet() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }
}
