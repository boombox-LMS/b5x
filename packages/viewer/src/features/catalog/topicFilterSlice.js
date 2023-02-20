import { createSlice } from "@reduxjs/toolkit";

export const topicFilterSlice = createSlice({
  name: "topicFilter",
  initialState: {
    priorityLevel: {
      available: false,
      recommended: true,
      assigned: true,
    },
    completionStatus: {
      "not started": true,
      "in progress": true,
      completed: false,
    },
  },
  reducers: {
    updateTopicFilter: (state, action) => {
      const { filterCategoryName, statusName, value } = action.payload;
      state[filterCategoryName][statusName] = value;
      return state;
    },
  },
});

export const { updateTopicFilter } = topicFilterSlice.actions;

export const selectCurrentTopicFilter = (state) => state.topicFilter;

export default topicFilterSlice.reducer;
