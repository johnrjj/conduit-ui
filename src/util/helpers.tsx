import { ThemedStyledFunction } from 'styled-components';

function withProps<U>() {
  return <P, T, O>(fn: ThemedStyledFunction<P, T, O>): ThemedStyledFunction<P & U, T, O & U> => fn;
}

export {
  withProps,
}