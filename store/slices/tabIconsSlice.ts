import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

interface TabIconsState {
  activeTab: string;
}

const initialState: TabIconsState = {
  activeTab: 'none',
};

const tabIconsSlice = createSlice({
  name: 'tabIcons',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
  },
});

export const { setActiveTab } = tabIconsSlice.actions;

export const selectActiveTab = (state: RootState) => state.tabIcons.activeTab;

export default tabIconsSlice.reducer; 