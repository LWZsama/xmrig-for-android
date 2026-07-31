import React from 'react';

export const useSimpleMovingAverage = (values: number[] = [], window: number = 5): number[] => {
  const [state, setState] = React.useState<number[]>([]);

  let index = window - 1;
  const length = values.length + 1;

  React.useEffect(() => {
    setState([]);

    // eslint-disable-next-line no-plusplus
    while (++index < length) {
      const windowSlice = values.slice(index - window, index);
      const sum = windowSlice.reduce((prev, curr) => prev + curr, 0);
      setState((oldState) => [...oldState, sum / window]);
    }
  }, [values, window]);

  return state;
};
