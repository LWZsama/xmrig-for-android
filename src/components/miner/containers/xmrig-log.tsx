/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { StyleSheet } from 'react-native';
import { View, ViewProps } from 'react-native-ui-lib';
import { AnsiComponent } from 'react-native-ansi-view';
import { ILoggerLine } from '../../../core/logger';
import _ from 'lodash';

type LogViewProps = ViewProps & {
    data: ILoggerLine[];
}

export const XMRigLogView:React.FC<LogViewProps> = ({
  data,
}) => (
  <View flex-1 paddingV-10 bg-black br40>
    {_.takeRight(data, 100).map((value, index) => (
      <AnsiComponent
        textStyle={styles.logTextDefault}
        containerStyle={styles.logContainer}
        ansi={value.message}
        key={`key-${value.id}-${index}`}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  logContainer: {
    backgroundColor: 'black',
    paddingVertical: 2,
    borderRadius: 0,
  },
  logTextDefault: {
    color: 'white',
    fontSize: 13,
  },
});
