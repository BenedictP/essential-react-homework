const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export type Lottery = {
  id: string;
  name: string;
  prize: string;
  status: string;
  type: string;
};

export async function getLotteries(): Promise<Lottery[]> {
  const response = await fetch(`${API_URL}/lotteries`);

  if (!response.ok) {
    throw new Error('Failed to load lotteries');
  }

  return (await response.json()) as Lottery[];
}

export async function createNewLottery({
  name,
  prize,
}: {
  name: string;
  prize: string;
}): Promise<Lottery> {
  const response = await fetch(`${API_URL}/lotteries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'simple',
      name,
      prize,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create the lottery');
  }

  return (await response.json()) as Lottery;
}
