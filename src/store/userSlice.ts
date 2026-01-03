import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  isOnboarded: boolean;
  skillLevel: 'beginner' | 'intermediate' | 'expert' | 'master' | null;
  playFrequency: string | null;
  gamesWon: {
    easy: number;
    medium: number;
    hard: number;
  };
  bestTimes: {
    easy: number | null;
    medium: number | null;
    hard: number | null;
  };
}

const initialState: UserState = {
  isOnboarded: false,
  skillLevel: null,
  playFrequency: null,
  gamesWon: {
    easy: 0,
    medium: 0,
    hard: 0,
  },
  bestTimes: { easy: null, medium: null, hard: null },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setOnboardingComplete: (
      state,
      action: PayloadAction<{
        skillLevel: UserState['skillLevel'];
        playFrequency: string;
      }>,
    ) => {
      state.isOnboarded = true;
      state.skillLevel = action.payload.skillLevel;
      state.playFrequency = action.payload.playFrequency;
    },
    hydrateUser: (state, action: PayloadAction<UserState>) => {
      state.isOnboarded = action.payload.isOnboarded;
      state.skillLevel = action.payload.skillLevel;
      state.playFrequency = action.payload.playFrequency;
      if (!state.gamesWon) {
        state.gamesWon = { easy: 0, medium: 0, hard: 0 };
      }
    },
    recordWin: (state, action: PayloadAction<'easy' | 'medium' | 'hard'>) => {
      if (!state.gamesWon) {
        state.gamesWon = { easy: 0, medium: 0, hard: 0 };
      }
      state.gamesWon[action.payload] += 1;
    },
    setGamesWon: (state, action: PayloadAction<UserState['gamesWon']>) => {
      state.gamesWon = action.payload;
    },
    resetOnboarding: state => {
      state.isOnboarded = false;
      state.skillLevel = null;
      state.playFrequency = null;
    },
    setBestTimes: (state, action: PayloadAction<UserState['bestTimes']>) => {
      state.bestTimes = action.payload;
    },
    updateBestTime: (
      state,
      action: PayloadAction<{
        difficulty: 'easy' | 'medium' | 'hard';
        time: number;
      }>,
    ) => {
      const { difficulty, time } = action.payload;
      const currentBest = state.bestTimes[difficulty];
      if (currentBest === null || time < currentBest) {
        state.bestTimes[difficulty] = time;
      }
    },
  },
});

export const {
  setOnboardingComplete,
  hydrateUser,
  recordWin,
  setGamesWon,
  resetOnboarding,
  setBestTimes,
  updateBestTime,
} = userSlice.actions;
export default userSlice.reducer;
