import * as React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { RootStackParamList } from '../navigation/types';
import { createNewLottery } from '../services/lottery';

type AddLotteryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddLottery'
>;

export function AddLotteryScreen() {
  const navigation = useNavigation<AddLotteryScreenNavigationProp>();
  const queryClient = useQueryClient();
  const [lotteryName, setLotteryName] = React.useState('');
  const [lotteryPrize, setLotteryPrize] = React.useState('');

  const createLotteryMutation = useMutation({
    mutationFn: createNewLottery,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lotteries'] });

      setLotteryName('');
      setLotteryPrize('');
      navigation.navigate('Home', {
        snackbarId: Date.now(),
        snackbarMessage: 'New lottery added successfully!',
      });
    },
  });

  const isSubmitting = createLotteryMutation.isPending;
  const nameHasError = lotteryName.length > 0 && lotteryName.length < 4;
  const prizeHasError = lotteryPrize.length > 0 && lotteryPrize.length < 4;
  const canAdd = lotteryName.length >= 4 && lotteryPrize.length >= 4;

  function handleSubmit() {
    if (!canAdd || isSubmitting) {
      return;
    }

    createLotteryMutation.mutate({
      name: lotteryName,
      prize: lotteryPrize,
    });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Add a new lottery</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Lottery name</Text>
          <TextInput
            autoCapitalize="sentences"
            editable={!isSubmitting}
            onChangeText={setLotteryName}
            returnKeyType="next"
            style={[styles.input, nameHasError ? styles.inputError : null]}
            value={lotteryName}
          />
          <Text style={[styles.helper, nameHasError ? styles.errorText : null]}>
            {nameHasError ? 'name must be at least 4 characters' : ' '}
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Lottery prize</Text>
          <TextInput
            autoCapitalize="sentences"
            editable={!isSubmitting}
            onChangeText={setLotteryPrize}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            style={[styles.input, prizeHasError ? styles.inputError : null]}
            value={lotteryPrize}
          />
          <Text
            style={[styles.helper, prizeHasError ? styles.errorText : null]}
          >
            {prizeHasError ? 'prize must be at least 4 characters' : ' '}
          </Text>
        </View>

        {createLotteryMutation.isError ? (
          <Text style={styles.submitError}>Failed to add lottery.</Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={!canAdd || isSubmitting}
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.button,
            !canAdd || isSubmitting ? styles.buttonDisabled : null,
            pressed ? styles.buttonPressed : null,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>ADD</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    alignItems: 'flex-start',
    paddingHorizontal: 32,
    paddingVertical: 56,
  },
  title: {
    marginBottom: 64,
    fontSize: 28,
    fontWeight: '600',
    color: '#111827',
  },
  field: {
    width: '100%',
    marginBottom: 28,
  },
  label: {
    marginBottom: 4,
    color: '#6b7280',
    fontSize: 14,
  },
  input: {
    width: '100%',
    minHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#6b7280',
    color: '#111827',
    fontSize: 18,
    paddingVertical: 8,
  },
  inputError: {
    borderBottomColor: '#dc2626',
  },
  helper: {
    marginTop: 6,
    minHeight: 18,
    color: '#6b7280',
    fontSize: 12,
  },
  errorText: {
    color: '#dc2626',
  },
  submitError: {
    marginBottom: 16,
    color: '#dc2626',
    fontSize: 14,
  },
  button: {
    minWidth: 92,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
