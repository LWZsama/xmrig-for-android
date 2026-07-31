import React from 'react';
import { KeyboardAvoidingView, TextInput, Appearance } from 'react-native';
import * as JSON5 from 'json5';
import {
  Card, View,
} from 'react-native-ui-lib';
import { AnsiComponent } from 'react-native-ansi-view';
import { ScrollView } from 'react-native-gesture-handler';
import { useStyledCode } from '../../../../../core/utils/ansi';
import { EditAdvanceCardProps } from './index';

export const EditAdvanceEditorCard: React.FC<EditAdvanceCardProps> = (
  { setLocalState, localState },
) => {
  const [code, setCode] = React.useState<string>('{}');

  const { styledCode, cleanCode } = useStyledCode(code, Appearance.getColorScheme() === 'dark');

  React.useEffect(() => {
    const data = localState.config?.toString() || '{}';
    try {
      setCode(JSON.stringify(JSON5.parse(data), null, 2));
    } catch (er) {
      console.log(er);
    }
  }, []);

  React.useEffect(() => {
    setLocalState((oldState) => ({
      ...oldState,
      config: cleanCode,
    }));
    console.log(cleanCode);
  }, [code]);

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
        <ScrollView contentContainerStyle={{ flex: 1, backgroundColor: 'black', borderRadius: 5 }}>
          <KeyboardAvoidingView>
            <TextInput
              multiline
              onChangeText={setCode}
              autoCorrect={false}
              spellCheck={false}
              textAlignVertical="top"
            >
              <AnsiComponent
                ansi={styledCode}
                textStyle={{
                  color: Appearance.getColorScheme() === 'dark' ? 'white' : 'black',
                }}
              />
            </TextInput>
          </KeyboardAvoidingView>
        </ScrollView>
      </View>
    </Card>
  );
};

export default EditAdvanceEditorCard;
