import * as React from 'react';
import styled from 'styled-components';
import { Table, AutoSizer, Column } from 'react-virtualized';

export class TradeTable extends React.Component<any, any> {
  constructor(props: { orders: any }) {
    super(props);
    this._getDatum = this._getDatum.bind(this);
  }

  render() {
    const { data, tableId } = this.props;
    console.log(data);
    const rowGetter = ({ index }: { index: number }) => this._getDatum(data, index);
    const rowCount = (data && data.length) || 0;
    return (
      <AutoSizer>
        {({ width, height }) => (
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
              label="BID"
              cellDataGetter={({ rowData }) => rowData.price}
              cellRenderer={({ cellData }) => cellData}
              dataKey="price"
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
