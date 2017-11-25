import * as React from 'react';
import styled from 'styled-components';

const OrderbookSummary = styled.section`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
  margin: 2rem 0;
`;

const OrderbookSummaryItemContainer = styled.div`
  text-align: right;
  margin-right: 0.5rem;
`;

const OrderbookSummaryItemTitle = styled.div`
  font-weight: 500;
  font-size: 36px;
  color: #374458;
  letter-spacing: 0;
  margin-bottom: 0.5rem;
`;

const OrderbookSummaryItemSubtitle = styled.div`
  font-family: 500;
  font-size: 16px;
  color: rgba(54, 68, 87, 0.66);
  letter-spacing: 0;
`;

const OrderbookSummaryItem = ({ title, subtitle, ...rest }: any) => (
  <OrderbookSummaryItemContainer>
    <OrderbookSummaryItemTitle>{title}</OrderbookSummaryItemTitle>
    <OrderbookSummaryItemSubtitle>{subtitle}</OrderbookSummaryItemSubtitle>
  </OrderbookSummaryItemContainer>
);

export { OrderbookSummary, OrderbookSummaryItem };
