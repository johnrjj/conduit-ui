import { BigNumber } from 'bignumber.js';


export interface TokenPairPartial {
  address: string;
  maxAmount: string;
  minAmount: string;
  precision: number;
  decimal: number;
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

export interface OrderDetails {
  price: BigNumber;
}
