import * as React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

export type RegisterSheetRef = TrueSheet;

type Props = {
  onRegister: (name: string) => void;
  selectedLotteryCount: number;
};

export const RegisterSheet = React.forwardRef<RegisterSheetRef, Props>(
  ({ onRegister, selectedLotteryCount }, ref) => {
    const [name, setName] = React.useState('');
    const canRegister = name.trim().length > 0 && selectedLotteryCount > 0;

    function handleRegister() {
      if (!canRegister) {
        return;
      }

      onRegister(name.trim());
      setName('');
    }

    return (
      <TrueSheet
        ref={ref}
        backgroundColor="#fff"
        cornerRadius={24}
        detents={['auto']}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Register to lotteries</Text>
          <TextInput
            autoCapitalize="words"
            accessibilityLabel="Enter your name"
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#c7c7c7"
            returnKeyType="done"
            style={styles.input}
            value={name}
          />

          <Pressable
            accessibilityRole="button"
            disabled={!canRegister}
            onPress={handleRegister}
            style={[styles.button, canRegister ? styles.buttonEnabled : null]}
          >
            <Text style={styles.buttonText}>Register</Text>
          </Pressable>
        </View>
      </TrueSheet>
    );
  },
);

RegisterSheet.displayName = 'RegisterSheet';

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 48,
  },
  title: {
    color: '#000',
    fontSize: 28,
    fontWeight: '400',
  },
  input: {
    width: '100%',
    minHeight: 48,
    marginTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#c7c7c7',
    color: '#111827',
    fontSize: 20,
    paddingVertical: 8,
  },
  button: {
    minWidth: 156,
    minHeight: 52,
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#c7c7c7',
    paddingHorizontal: 24,
  },
  buttonEnabled: {
    backgroundColor: '#2563eb',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
});
