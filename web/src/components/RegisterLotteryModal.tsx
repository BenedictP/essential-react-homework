import {Alert, Box, Button, Dialog, TextField, Typography} from '@mui/material';
import {useMutation} from '@tanstack/react-query';
import {useState} from 'react';
import {registerToLottery} from '../services/lottery.ts';

interface Props {
    isOpen: boolean;
    lotteryIds: string[];
    onClose: () => void;
    submitted: () => void;
}

export default function RegisterLotteryModal({
                                                 isOpen,
                                                 lotteryIds,
                                                 onClose,
                                                 submitted,
                                             }: Props) {
    const [participantName, setParticipantName] = useState('');
    const nameHasError = participantName.length > 0 && participantName.trim().length === 0;
    const canRegister = participantName.trim().length > 0 && lotteryIds.length > 0;
    const registerMutation = useMutation({
        mutationFn: () =>
            Promise.all(
                lotteryIds.map((lotteryId) =>
                    registerToLottery({
                        name: participantName.trim(),
                        lotteryId,
                    }),
                ),
            ),
        onSuccess: () => {
            setParticipantName('');
            submitted();
        },
    });

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            sx={{
                '& .MuiDialog-paper': {
                    width: 760,
                    maxWidth: 'calc(100% - 64px)',
                    borderRadius: 0,
                },
            }}
        >
            <Box
                component="form"
                onSubmit={(event) => {
                    event.preventDefault();

                    if (canRegister) {
                        registerMutation.mutate();
                    }
                }}
                sx={{
                    alignItems: 'flex-start',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 330,
                    padding: '56px 84px 40px',
                }}
            >
                <Typography
                    variant="h4"
                    component="h2"
                    sx={{marginBottom: 2}}
                >
                    Register
                </Typography>

                <Typography
                    color="text.secondary"
                    sx={{marginBottom: 6}}
                >
                    {lotteryIds.length} selected {lotteryIds.length === 1 ? 'lottery' : 'lotteries'}
                </Typography>

                {registerMutation.isError && (
                    <Alert
                        severity="error"
                        sx={{marginBottom: 3, width: '100%'}}
                    >
                        Failed to register for the selected lotteries.
                    </Alert>
                )}

                <TextField
                    variant="standard"
                    label="Your name"
                    value={participantName}
                    onChange={(event) => setParticipantName(event.target.value)}
                    error={nameHasError}
                    helperText={nameHasError ? 'name must not be empty' : ' '}
                    fullWidth
                    sx={{marginBottom: 3}}
                />

                <Button
                    type="submit"
                    variant="contained"
                    disabled={!canRegister}
                    loading={registerMutation.isLoading}
                    sx={{
                        minWidth: 120,
                        height: 52,
                    }}
                >
                    Register
                </Button>
            </Box>
        </Dialog>
    );
}
