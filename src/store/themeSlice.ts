import { createSlice } from '@reduxjs/toolkit';

interface ThemeState {
  isDarkMode: boolean;
  isSoundEnabled: boolean;
}

const initialState: ThemeState = {
  isDarkMode: false,
  isSoundEnabled: true,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: state => {
      state.isDarkMode = !state.isDarkMode;
    },
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
    },
    toggleSound: state => {
      state.isSoundEnabled = !state.isSoundEnabled;
    },
    setSoundEnabled: (state, action) => {
      state.isSoundEnabled = action.payload;
    },
  },
});

export const { toggleTheme, setDarkMode, toggleSound, setSoundEnabled } =
  themeSlice.actions;
export default themeSlice.reducer;
