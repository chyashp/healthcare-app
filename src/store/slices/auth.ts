import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserRole } from "@/types/database";

interface AuthState {
  userId: string | null;
  role: UserRole | null;
  fullName: string | null;
  avatarUrl: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  userId: null,
  role: null,
  fullName: null,
  avatarUrl: null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(
      state,
      action: PayloadAction<{
        userId: string;
        role: UserRole;
        fullName: string | null;
        avatarUrl: string | null;
      }>
    ) {
      state.userId = action.payload.userId;
      state.role = action.payload.role;
      state.fullName = action.payload.fullName;
      state.avatarUrl = action.payload.avatarUrl;
      state.loading = false;
    },
    clearUser(state) {
      state.userId = null;
      state.role = null;
      state.fullName = null;
      state.avatarUrl = null;
      state.loading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setUser, clearUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
