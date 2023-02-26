import { configureStore } from "@reduxjs/toolkit";
import { api } from "../features/api/apiSlice";
import envReducer from "../envSlice";
import headerReducer from "../features/layout/header/headerSlice";
import topicFilterReducer from "../features/catalog/topicFilterSlice";

export default configureStore({
  reducer: {
    env: envReducer,
    header: headerReducer,
    topicFilter: topicFilterReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
