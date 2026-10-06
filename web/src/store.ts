import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  roles: string[];
}

const initialState: AuthState = {
  token: null,
  roles: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    setRoles(state, action: PayloadAction<string[]>) {
      state.roles = action.payload;
    },
    logout(state) {
      state.token = null;
      state.roles = [];
    },
  },
});

export const { setToken, setRoles, logout } = authSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
export type { RootState };
