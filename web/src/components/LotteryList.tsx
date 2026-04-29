import {useQuery} from '@tanstack/react-query';
import {
    Alert,
    Box,
    Checkbox,
    Chip,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';
import {getLotteries} from '../services/lottery.ts';

interface Props {
    lotteryNameFilter: string;
    selectedLotteryIds: string[];
    onToggleLottery: (lotteryId: string) => void;
}

export default function LotteryList({
                                        lotteryNameFilter,
                                        selectedLotteryIds,
                                        onToggleLottery,
                                    }: Props) {
    const {
        data: lotteries = [],
        isError,
        isLoading,
    } = useQuery({
        queryKey: ['lotteries'],
        queryFn: getLotteries,
    });
    const normalizedLotteryNameFilter = lotteryNameFilter.trim().toLowerCase();
    const filteredLotteries = normalizedLotteryNameFilter
        ? lotteries.filter((lottery) =>
            lottery.name.toLowerCase().includes(normalizedLotteryNameFilter),
        )
        : lotteries;

    if (isLoading) {
        return (
            <Box
                sx={{
                    alignItems: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    minHeight: 220,
                    justifyContent: 'center',
                }}
            >
                <CircularProgress aria-label="Loading lotteries"/>
            </Box>
        );
    }

    if (isError) {
        return (
            <Alert severity="error">
                Failed to load lotteries.
            </Alert>
        );
    }

    if (!lotteries.length) {
        return (
            <Box
                sx={{
                    alignItems: 'center',
                    border: '1px dashed',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'center',
                    minHeight: 220,
                    padding: 3,
                }}
            >
                <Typography color="text.secondary">
                    No lotteries available.
                </Typography>
            </Box>
        );
    }

    if (!filteredLotteries.length) {
        return (
            <Box
                sx={{
                    alignItems: 'center',
                    border: '1px dashed',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'center',
                    minHeight: 220,
                    padding: 3,
                }}
            >
                <Typography color="text.secondary">
                    No lotteries match your search.
                </Typography>
            </Box>
        );
    }

    return (
        <Stack
            component="ul"
            sx={{
                border: '1px solid',
                borderColor: 'divider',
                listStyle: 'none',
                margin: 0,
                padding: 0,
            }}
        >
            {filteredLotteries.map((lottery) => {
                const isSelected = selectedLotteryIds.includes(lottery.id);

                return (
                    <Box
                        aria-checked={isSelected}
                        component="li"
                        key={lottery.id}
                        onClick={() => onToggleLottery(lottery.id)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                onToggleLottery(lottery.id);
                            }
                        }}
                        role="checkbox"
                        tabIndex={0}
                        sx={{
                            alignItems: {xs: 'flex-start', sm: 'center'},
                            backgroundColor: isSelected ? 'action.selected' : 'background.paper',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: {xs: 'column', sm: 'row'},
                            gap: 2,
                            justifyContent: 'space-between',
                            padding: 2,
                            '&:hover': {
                                backgroundColor: 'action.hover',
                            },
                            '&:last-child': {
                                borderBottom: 0,
                            },
                        }}
                    >
                        <Box
                            sx={{
                                alignItems: 'center',
                                display: 'flex',
                                gap: 2,
                            }}
                        >
                            <Checkbox
                                aria-label={`Select ${lottery.name}`}
                                checked={isSelected}
                                onChange={() => onToggleLottery(lottery.id)}
                                onClick={(event) => event.stopPropagation()}
                            />

                            <Box>
                                <Typography variant="h6" component="h2">
                                    {lottery.name}
                                </Typography>
                                <Typography color="text.secondary">
                                    {lottery.prize}
                                </Typography>
                            </Box>
                        </Box>

                        <Chip
                            color={lottery.status === 'running' ? 'success' : 'default'}
                            label={lottery.status}
                            size="small"
                        />
                    </Box>
                );
            })}
        </Stack>
    );
}
