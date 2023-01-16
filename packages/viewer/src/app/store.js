import { configureStore } from "@reduxjs/toolkit";
import { api } from "../features/api/apiSlice";
import envReducer from "../envSlice";
import headerReducer from "../features/header/headerSlice";

export default configureStore({
  reducer: {
    env: envReducer,
    header: headerReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
