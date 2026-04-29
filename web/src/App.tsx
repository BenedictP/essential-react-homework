import './App.css'
import {Box, Fab, InputAdornment, Snackbar, TextField, Typography} from "@mui/material";
import {Add, HowToReg, Search} from '@mui/icons-material';
import NewLotteryModal from "./components/NewLotteryModal.tsx";
import {useState} from "react";
import LotteryList from "./components/LotteryList.tsx";
import {useQueryClient} from "@tanstack/react-query";
import RegisterLotteryModal from "./components/RegisterLotteryModal.tsx";

function App() {

    const [newLotteryModalOpen, setNewLotteryModalOpen] = useState(false);
    const [registerLotteryModalOpen, setRegisterLotteryModalOpen] = useState(false);
    const [selectedLotteryIds, setSelectedLotteryIds] = useState<string[]>([]);
    const [lotteryNameFilter, setLotteryNameFilter] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const queryClient = useQueryClient();

    const toggleLottery = (lotteryId: string) => {
        setSelectedLotteryIds((currentLotteryIds) =>
            currentLotteryIds.includes(lotteryId)
                ? currentLotteryIds.filter((selectedLotteryId) => selectedLotteryId !== lotteryId)
                : [...currentLotteryIds, lotteryId],
        );
    };

    return (
        <main className="app">
            <Box className="app__content">
                <Box className="app__header">
                    <Typography variant="h3" component="h1">
                        Lotteries
                    </Typography>
                    <Typography color="text.secondary">
                        Running and finished prize draws
                    </Typography>
                </Box>

                <TextField
                    label="Filter by lottery name"
                    value={lotteryNameFilter}
                    onChange={(event) => setLotteryNameFilter(event.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search/>
                                </InputAdornment>
                            ),
                        },
                    }}
                    fullWidth
                    sx={{marginBottom: 3}}
                />

                <LotteryList
                    lotteryNameFilter={lotteryNameFilter}
                    selectedLotteryIds={selectedLotteryIds}
                    onToggleLottery={toggleLottery}
                />
            </Box>

            <NewLotteryModal
                isOpen={newLotteryModalOpen}
                submitted={() => {
                    queryClient.invalidateQueries({queryKey: ['lotteries']});
                    setNewLotteryModalOpen(false);
                    setSnackbarMessage('New lottery created');
                    setSnackbarOpen(true);
                }}
                onClose={() => setNewLotteryModalOpen(false)}/>

            <RegisterLotteryModal
                isOpen={registerLotteryModalOpen}
                lotteryIds={selectedLotteryIds}
                submitted={() => {
                    setRegisterLotteryModalOpen(false);
                    setSelectedLotteryIds([]);
                    setSnackbarMessage('Registered for selected lotteries');
                    setSnackbarOpen(true);
                }}
                onClose={() => setRegisterLotteryModalOpen(false)}
            />

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />

            <Fab
                color="secondary"
                disabled={!selectedLotteryIds.length}
                size="large"
                variant="extended"
                onClick={() => setRegisterLotteryModalOpen(true)}
                sx={{
                    position: 'fixed',
                    right: 24,
                    bottom: 96,
                }}
            >
                <HowToReg/>
                Register
                {selectedLotteryIds.length > 0 ? ` (${selectedLotteryIds.length})` : ''}
            </Fab>

            <Fab
                color="primary"
                size="large"
                variant="extended"
                onClick={() => setNewLotteryModalOpen(true)}
                sx={{
                    position: 'fixed',
                    right: 24,
                    bottom: 24,
                }}
            >
                <Add/>
                Add lottery
            </Fab>
        </main>
    )
}

export default App
