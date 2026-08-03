import React from 'react';
import { KeyboardAvoidingView, TextInput } from 'react-native';
import * as JSON5 from 'json5';
import {
  Card, View,
} from 'react-native-ui-lib';
import { EditAdvanceCardProps } from './index';

const formatConfiguration = (configuration?: string): string => {
  const data = configuration || '{}';
  try {
    return JSON.stringify(JSON5.parse(data), null, 2);
  } catch {
    return data;
  }
};

export const EditAdvanceEditorCard: React.FC<EditAdvanceCardProps> = (
  { setLocalState, localState },
) => {
  const [code, setCode] = React.useState<string>(() => formatConfiguration(localState.config));
  const latestCode = React.useRef(code);
  const commitTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const commitCode = React.useCallback((nextCode: string) => {
    setLocalState((oldState) => {
      if (oldState.config === nextCode) {
        return oldState;
      }
      return {
        ...oldState,
        config: nextCode,
      };
    });
  }, [setLocalState]);

  const scheduleCommit = React.useCallback((nextCode: string) => {
    if (commitTimer.current !== null) {
      clearTimeout(commitTimer.current);
    }
    commitTimer.current = setTimeout(() => {
      commitTimer.current = null;
      commitCode(nextCode);
    }, 160);
  }, [commitCode]);

  const handleChangeText = React.useCallback((nextCode: string) => {
    latestCode.current = nextCode;
    setCode(nextCode);
    scheduleCommit(nextCode);
  }, [scheduleCommit]);

  const commitImmediately = React.useCallback(() => {
    if (commitTimer.current !== null) {
      clearTimeout(commitTimer.current);
      commitTimer.current = null;
    }
    commitCode(latestCode.current);
  }, [commitCode]);

  React.useEffect(() => () => {
    if (commitTimer.current !== null) {
      clearTimeout(commitTimer.current);
      commitTimer.current = null;
    }
  }, []);

  return (
    <Card style={{ flexGrow: 1 }} useSafeArea>
      <View centerV spread padding-20 paddingB-5>
        <View row>
          <Card.Section
            content={[
              { text: 'Config JSON', text65: true, $textDefault: true },
            ]}
          />
        </View>
      </View>

      <View spread padding-20 paddingT-0 paddingB-20 style={{ flexGrow: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }}>
          <TextInput
            style={{
              flex: 1,
              minHeight: 240,
              backgroundColor: 'black',
              borderRadius: 5,
              color: 'white',
              padding: 10,
              fontFamily: 'monospace',
            }}
            multiline
            value={code}
            onChangeText={handleChangeText}
            onBlur={commitImmediately}
            autoCorrect={false}
            spellCheck={false}
            autoCapitalize="none"
            scrollEnabled
            textAlignVertical="top"
          />
        </KeyboardAvoidingView>
      </View>
    </Card>
  );
};

export default EditAdvanceEditorCard;
