import * as React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { SignedOrderWithMetadata } from '../types';

export interface TradeTableProps {
  data: Array<SignedOrderWithMetadata>;
  headerTitle: string;
  noOrdersText: string;
  baseTokenSymbol: string;
  quoteTokenSymbol: string;
  loading: boolean;
}

export class TradeTable extends React.Component<TradeTableProps, any> {
  render() {
    const {
      data,
      headerTitle,
      baseTokenSymbol,
      quoteTokenSymbol,
      loading,
      noOrdersText,
    } = this.props;
    return (
      <ReactTable
        loading={loading}
        showPagination={false}
        noDataText={noOrdersText}
        data={data.length ? data : loading ? [''] : []}
        columns={
          [
            {
              Header: headerTitle,
              columns: [
                {
                  Header: 'Price',
                  id: 'price',
                  accessor: d => d && (d as SignedOrderWithMetadata).price.toFixed(10),
                },
                {
                  Header: baseTokenSymbol,
                  id: 'baseTokenAmount',
                  accessor: d => d && (d as SignedOrderWithMetadata).baseUnitAmount.toFixed(10),
                },
                {
                  Header: quoteTokenSymbol,
                  id: 'quoteTokenAmount',
                  accessor: d => d && (d as SignedOrderWithMetadata).quoteUnitAmount.toFixed(10),
                },
              ],
            },
          ] as any
        }
        style={{
          width: '100%',
          // boxShadow: '0 2px 4px 0 rgba(36,48,86,0.20)',
          // height: '400px',
        }}
        className="-striped -highlight"
      />
    );
  }
}
