import { createMMKV } from 'react-native-mmkv';

export const lotteryRegistrationStorage = createMMKV({
  id: 'lottery-registration-storage',
});

export const REGISTERED_LOTTERY_IDS_KEY = 'registeredLotteryIds';

export function parseRegisteredLotteryIds(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(value);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (lotteryId): lotteryId is string => typeof lotteryId === 'string',
    );
  } catch {
    return [];
  }
}

export function serializeRegisteredLotteryIds(lotteryIds: string[]): string {
  return JSON.stringify(Array.from(new Set(lotteryIds)));
}
