import {Box, Button, Dialog, TextField, Typography} from "@mui/material";
import {useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {createNewLottery} from "../services/lottery.ts";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    submitted: () => void;
}


export default function NewLotteryModal({
                                            isOpen,
                                            onClose,
                                            submitted,
                                        }: Props) {
    const [lotteryName, setLotteryName] = useState('');
    const [lotteryPrize, setLotteryPrize] = useState('');
    const nameHasError = lotteryName.length > 0 && lotteryName.length < 4;
    const prizeHasError = lotteryPrize.length > 0 && lotteryPrize.length < 4;
    const canAdd = lotteryName.length >= 4 && lotteryPrize.length >= 4;
    const createLotteryMutation = useMutation({
        mutationFn: () =>
            createNewLottery({
                name: lotteryName,
                prize: lotteryPrize,
            }),
        onSuccess: () => {
            setLotteryName('')
            setLotteryPrize('')
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

                    if (canAdd) {
                        createLotteryMutation.mutate();
                    }
                }}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '56px 84px 40px',
                    minHeight: 430,
                }}
            >
                <Typography
                    variant="h4"
                    component="h2"
                    sx={{marginBottom: 8}}
                >
                    Add a new lottery
                </Typography>

                <TextField
                    variant="standard"
                    label="Lottery name"
                    value={lotteryName}
                    onChange={(event) => setLotteryName(event.target.value)}
                    error={nameHasError}
                    helperText={nameHasError ? 'name must be at least 4 characters' : ' '}
                    fullWidth
                    sx={{marginBottom: 4}}
                />

                <TextField
                    variant="standard"
                    label="Lottery prize"
                    value={lotteryPrize}
                    onChange={(event) => setLotteryPrize(event.target.value)}
                    error={prizeHasError}
                    helperText={prizeHasError ? 'prize must be at least 4 characters' : ' '}
                    fullWidth
                    sx={{marginBottom: 3}}
                />

                <Button
                    type="submit"
                    variant="contained"
                    disabled={!canAdd}
                    loading={createLotteryMutation.isLoading}
                    sx={{
                        minWidth: 92,
                        height: 52,
                    }}
                >
                    ADD
                </Button>
            </Box>
        </Dialog>
    );
}
