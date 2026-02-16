import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Appointment, AppointmentStatus } from "@/types/database";

interface AppointmentsState {
  list: Appointment[];
  selected: Appointment | null;
  statusFilter: AppointmentStatus | "all";
  loading: boolean;
}

const initialState: AppointmentsState = {
  list: [],
  selected: null,
  statusFilter: "all",
  loading: false,
};

const appointmentsSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    setAppointments(state, action: PayloadAction<Appointment[]>) {
      state.list = action.payload;
      state.loading = false;
    },
    setSelectedAppointment(
      state,
      action: PayloadAction<Appointment | null>
    ) {
      state.selected = action.payload;
    },
    setStatusFilter(
      state,
      action: PayloadAction<AppointmentStatus | "all">
    ) {
      state.statusFilter = action.payload;
    },
    setAppointmentsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const {
  setAppointments,
  setSelectedAppointment,
  setStatusFilter,
  setAppointmentsLoading,
} = appointmentsSlice.actions;
export default appointmentsSlice.reducer;
