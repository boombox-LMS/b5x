import { createSlice } from "@reduxjs/toolkit";

export const headerSlice = createSlice({
  name: "header",
  initialState: {
    isHidden: true,
    title: "",
  },
  reducers: {
    setHeaderProps: (state, action) => {
      state = action.payload;
      return state;
    },
  },
});

export const { setHeaderProps } = headerSlice.actions;

export const selectHeaderProps = (state) => state.header;

export default headerSlice.reducer;
