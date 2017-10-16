import * as React from 'react';
import styled from 'styled-components';
import { Table, AutoSizer, Column } from 'react-virtualized';
import { subHours, subMinutes, subDays, distanceInWordsToNow } from 'date-fns';

const dateFiveHoursAgo = subHours(new Date(), 5);
const dateTenMinutesAgo = subMinutes(new Date(), 10);
const dateTwoDaysAgo = subDays(new Date(), 2);

const data = [
  {
    index: 0,
    maker: '7.14 ZRX',
    taker: '10.100 MKR',
    exchange: '1 ZRX / 1.3 MKR',
    date: dateTenMinutesAgo,
  },
  {
    index: 1,
    maker: '1 WETH',
    taker: '10.00000 DGB',
    exchange: '1 WETH / 10 DGB',
    date: dateFiveHoursAgo,
  },
  {
    index: 2,
    maker: '7.14 ZRX',
    taker: '10.100 MKR',
    exchange: '1 ZRX / 1.3 MKR',
    date: dateTwoDaysAgo,
  },
];

export const TableFlexGrow = styled.div`
  position: relative;
  display: flex;
  flex: 1;
`;

export class TradeTable extends React.Component {
  constructor(props: { data: any }) {
    super(props);
    this._getDatum = this._getDatum.bind(this);
    this.state = {};
  }

  render() {
    const rowGetter = ({ index }: { index: number }) => this._getDatum(data, index);
    const rowCount = data.length;

    return (
      <AutoSizer>
        {({ width, height }) => (
          <Table
            ref="Table"
            width={width}
            height={height}
            rowHeight={64}
            rowCount={rowCount}
            headerHeight={64}
            rowGetter={rowGetter}
            disableHeader={false}
          >
            <Column
              label="OFFERING"
              cellDataGetter={({ rowData }) => rowData.maker}
              cellRenderer={({ cellData }) => cellData}
              dataKey="maker"
              width={120}
              flexGrow={1}
            />

            <Column
              label="IN EXCHANGE FOR"
              cellDataGetter={({ rowData }) => rowData.taker}
              cellRenderer={({ cellData }) => cellData}
              dataKey="taker"
              width={120}
              flexGrow={1}
            />

            <Column
              label="EXCHANGE RATE"
              cellDataGetter={({ rowData }) => rowData.exchange}
              cellRenderer={({ cellData }) => cellData}
              dataKey="exchange"
              width={120}
              flexGrow={1}
            />
            <Column
              label="DATE ADDED"
              cellDataGetter={({ rowData }) =>
                distanceInWordsToNow(rowData.date, { includeSeconds: true, addSuffix: true })}
              cellRenderer={({ cellData }) => cellData}
              dataKey="val"
              width={120}
              flexGrow={1}
            />
          </Table>
        )}
      </AutoSizer>
    );
  }

  _getDatum(arr: Array<any>, idx: number) {
    return arr[idx];
  }
}
