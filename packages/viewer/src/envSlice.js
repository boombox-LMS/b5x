import { createSlice } from "@reduxjs/toolkit";

export const envSlice = createSlice({
  name: "env",
  initialState: "prod",
  reducers: {
    setEnv: (state, action) => {
      state = action.payload.env;
      return state;
    },
  },
});

export const { setEnv } = envSlice.actions;

export const selectEnv = (state) => state.env;

export default envSlice.reducer;
