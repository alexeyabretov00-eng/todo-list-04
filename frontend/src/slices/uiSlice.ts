import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  selectedListId: string | null;
}

const initialState: UiState = {
  selectedListId: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    selectList(state, action: PayloadAction<string | null>) {
      state.selectedListId = action.payload;
    },
  },
});

export const { selectList } = uiSlice.actions;
