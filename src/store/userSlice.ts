import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the User State
export interface UserState {
  isOnboarded: boolean;
  skillLevel: 'beginner' | 'intermediate' | 'expert' | 'master' | null;
  playFrequency: string | null; // e.g., "1-2 days/week"
  gamesWon: {
    easy: number;
    medium: number;
    hard: number;
  };
}

// Initial State
const initialState: UserState = {
  isOnboarded: false,
  skillLevel: null,
  playFrequency: null,
  gamesWon: {
    easy: 0,
    medium: 0,
    hard: 0,
  },
};

// Create Slice
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
      // Ensure gamesWon exists if hydrating from older state version
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
  },
});

export const {
  setOnboardingComplete,
  hydrateUser,
  recordWin,
  setGamesWon,
  resetOnboarding,
} = userSlice.actions;
export default userSlice.reducer;
