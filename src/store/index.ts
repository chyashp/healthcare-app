import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth";
import uiReducer from "./slices/ui";
import appointmentsReducer from "./slices/appointments";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    appointments: appointmentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
