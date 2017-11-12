import { BigNumber } from 'bignumber.js';

export interface TokenPair {
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
