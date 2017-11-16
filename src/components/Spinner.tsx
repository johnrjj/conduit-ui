import * as React from 'react';
import styled, { keyframes } from 'styled-components';
import { withProps } from '../util/helpers';

interface SpinnerBarProps {
  transformRotationDegrees: number | string;
  animationDelaySeconds: number | string;
}

const ReactSpinnerSpinAnimation = keyframes`
  0% { opacity: 1; }
  100% { opacity: 0.15; }  
`;

const SpinnerBar = withProps<SpinnerBarProps>()(styled.div)`
  animation: ${ReactSpinnerSpinAnimation} 1.2s linear infinite;
  border-radius: 5px;
  background-color: #374458;
  position: absolute;
  width: 20%;
  height: 7.8%;
  top: -3.9%;
  left: -10%;
  transform: rotate(${props => (props as any).transformRotationDegrees}deg) translate(146%);
  animation-delay: ${props => (props as any).animationDelaySeconds}s;
`;

const SpinnerContainer = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
  top: 50%;
  left: 50%;
`;

const Spinner = props => {
  let bars: Array<any> = [];
  for (let i = 0; i < 12; i++) {
    let barStyle = {};
    const animationDelaySeconds = (i - 12) / 10;
    const transformRotationDegrees = i * 30;
    bars.push(
      <SpinnerBar
        animationDelaySeconds={animationDelaySeconds}
        transformRotationDegrees={transformRotationDegrees}
        key={i}
      />
    );
  }
  return <SpinnerContainer {...props}>{bars}</SpinnerContainer>;
};

export { Spinner };
