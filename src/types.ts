import { BigNumber } from 'bignumber.js';
import { SignedOrder } from '0x.js';

export interface TokenPairPartial {
  address: string;
  maxAmount: string;
  minAmount: string;
  precision: number;
  decimals: number;
  name: string;
  symbol: string;
}

export interface FullTokenPairData {
  baseToken: TokenPairPartial;
  quoteToken: TokenPairPartial;
  symbolTicker: string;
  nameTicker: string;
}

export interface TokenPairFromApi {
  [key: string]: {
    address: string;
    maxAmount: string;
    minAmount: string;
    precision: number;
  };
}

export interface Token {}

export interface SignedOrderWithMetadata extends SignedOrder {
  price: BigNumber;
  baseUnitAmount: BigNumber,
  quoteUnitAmount: BigNumber,
}