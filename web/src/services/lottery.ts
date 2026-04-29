import type {Lottery} from '../types';

export async function createNewLottery({
                                           name,
                                           prize,
                                       }: {
    name: string;
    prize: string;
}): Promise<Lottery> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/lotteries`, {
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

        const body = (await response.json()) as Lottery;

        return body;
    } catch (e) {
        console.error(e);

        throw e;
    }
}

export async function getLotteries() {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/lotteries`);

        const body = (await response.json()) as Array<Lottery>;

        return body;
    } catch (e) {
        console.error(e);

        throw e;
    }
}

export async function registerToLottery({
                                            name,
                                            lotteryId,
                                        }: {
    name: string;
    lotteryId: string;
}) {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({name, lotteryId}),
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }
    } catch (e) {
        console.error(e);

        throw e;
    }
}
