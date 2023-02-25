import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
// TODO: Is there a correct way to import component CSS?
import "./css/global.css";
import "./css/activity-indicator.css";
import "./css/circular-progress-bar.css";
import "./css/topic.css";
import "./css/dropzone.css";
import "./css/selected-text-menu.css";
import "./css/table-of-contents.css";
import "./css/topic-card.css";
import "./css/rtf-input.css";
import "./css/short-text-question.css";
import "./css/select-question.css";
import "./css/next-button.css";
import "./css/continue-button.css";
import "./css/rubric.css";
import "./css/visual-list.css";
import "./css/breakout-box.css";
import "./css/nps-question.css";
import App from "./App";
import store from "./app/store";
import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";
// import * as serviceWorker from './serviceWorker';

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
