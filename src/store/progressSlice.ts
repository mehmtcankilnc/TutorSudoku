import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProgressState {
  completedTutorials: string[];
}

const initialState: ProgressState = {
  completedTutorials: [],
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setCompletedTutorials: (state, action: PayloadAction<string[]>) => {
      state.completedTutorials = action.payload;
    },
    markTutorialComplete: (state, action: PayloadAction<string>) => {
      if (!state.completedTutorials.includes(action.payload)) {
        state.completedTutorials.push(action.payload);
      }
    },
    resetProgress: state => {
      state.completedTutorials = [];
    },
  },
});

export const { setCompletedTutorials, markTutorialComplete, resetProgress } =
  progressSlice.actions;
export default progressSlice.reducer;
