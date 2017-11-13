import * as React from 'react';
import styled from 'styled-components';
import { SignedOrder } from '0x.js';
import { Table, AutoSizer, Column } from 'react-virtualized';

export interface TradeTableProps {
  data: Array<SignedOrder>;
  tableId: string;
}

export class TradeTable extends React.Component<TradeTableProps, any> {
  render() {
    const { data, tableId } = this.props;
    const rowGetter = ({ index }: { index: number }) => this._getDatum(data, index);
    const rowCount = (data && data.length) || 0;
    return (
      <AutoSizer>
        {({ width, height }) => (
          <div>
          <Table
            ref={tableId}
            width={width}
            height={height}
            rowHeight={64}
            rowCount={rowCount}
            headerHeight={64}
            rowGetter={rowGetter}
            disableHeader={false}
          >
            <Column
              key="price"
              label="Price"
              cellDataGetter={({ rowData }) => rowData.makerTokenAmount}
              cellRenderer={({ cellData }) => cellData}
              dataKey="price"
              width={120}
              flexGrow={1}
            />
            <Column
              key="baseAmount"
              label="Base Token"
              cellDataGetter={({ rowData }) => rowData.makerTokenAmount}
              cellRenderer={({ cellData }) => cellData}
              dataKey="baseTokenAmount"
              width={120}
              flexGrow={1}
            />
            <Column
              key="quoteAmount"
              label="Quote Token"
              cellDataGetter={({ rowData }) => rowData.takerTokenAmount}
              cellRenderer={({ cellData }) => cellData}
              dataKey="quoteTokenAmount"
              width={120}
              flexGrow={1}
            />
          </Table>
          </div>
        )}
      </AutoSizer>
    );
  }

  _getDatum = (arr: Array<any>, idx: number) => {
    return arr[idx];
  };
}
