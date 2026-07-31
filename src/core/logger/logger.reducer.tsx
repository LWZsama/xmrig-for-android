import React from 'react';
import uuid from 'react-native-uuid';
import { LoggerActionType } from './logger.actions';
import { ILoggerLine, ILoggerReducerAction } from './logger.interface';

export const LoggerReducer:React.Reducer<ILoggerLine[], ILoggerReducerAction> = (
  prevState: ILoggerLine[],
  action: ILoggerReducerAction,
) => {
  switch (action.type) {
    case LoggerActionType.LOG:
      return [
        ...prevState,
        {
          ...action.value,
          id: uuid.v4().toString(),
          ts: new Date(),
        } as ILoggerLine,
      ];
    case LoggerActionType.RESET:
      return [];
    default:
  }
  return prevState;
};
