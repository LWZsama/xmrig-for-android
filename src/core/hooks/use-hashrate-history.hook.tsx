import React from 'react';

export const useHashrateHistory = (initial:number[]) => {
  const [history, setHistory] = React.useState<number[]>(initial);
  const add = React.useCallback((value:number) => setHistory((h) => [...h, value].slice(-60)), []);
  const reset = () => setHistory(initial);
  return {
    history,
    add,
    reset,
  };
};
