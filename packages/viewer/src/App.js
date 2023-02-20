import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  useLocation,
} from "react-router-dom";
import { Sandbox } from "./features/sandbox/Sandbox";
import { UserProfile } from "./features/user/UserProfile";
import { LoginForm } from "./features/user/LoginForm";
import { ControlPanel } from "./features/control-panel/ControlPanel";
import { Catalog } from "./features/catalog/Catalog";
import { TopicContents } from "./features/topic/TopicContents";
import { TopicHomePage } from "./features/topic/TopicHomePage";
import { Dashboard } from "./features/dashboard/Dashboard";
import { useGetCurrentUserInfoQuery } from "./features/api/apiSlice";
import { LoadingOutlined } from "@ant-design/icons";
import { HelpDesk } from "./features/helpdesk/HelpDesk";
import { ThemeProvider } from "@mui/material/styles";
import { Header } from "./features/layout/header/Header";
import { TopicPublisher } from "./features/publishing/TopicPublisher";
import { muiTheme } from "./theme";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

function App() {
  const {
    data: user,
    isLoading: userIsLoading,
    isSuccess: userLoadedSuccessfully,
    isError: userHasError,
    error: userError,
  } = useGetCurrentUserInfoQuery();

  // TODO: Use react-router pathname instead?
  // Would require a v6-friendly update of this approach:
  // https://stackoverflow.com/questions/33188994/scroll-to-the-top-of-the-page-after-render-in-react-js
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [window.location.href]);

  let content;

  if (userIsLoading) {
    content = <LoadingOutlined />;
  } else if (userLoadedSuccessfully) {
    if (user && user.email) {
      content = <Catalog />;
    } else {
      content = <LoginForm />;
    }
  } else if (userHasError) {
    content = <div>User fetch error: {JSON.stringify(userError)}</div>;
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <Router>
        <ScrollToTop />
        <div className="App">
          <style>
            @import
            url('https://fonts.googleapis.com/css2?family=Bungee+Shade&display=swap');
          </style>
          <Header logoHeight={70} headerMenuHeight={50}></Header>
          <React.StrictMode>
            <Routes>
              <Route
                exact
                path="/"
                element={<React.Fragment>{content}</React.Fragment>}
              />
              <Route exact path="/login" element={<LoginForm />} />
              <Route exact path="/users/:username" element={<UserProfile />} />
              <Route exact path="/dashboard" element={<Dashboard />} />
              <Route exact path="/control-panel" element={<ControlPanel />} />
              <Route
                exact
                path="/topics/:topicSlugOrUri"
                element={<TopicHomePage />}
              />
              <Route
                exact
                path="/topics/:topicUri/documents/:documentUri"
                element={<TopicContents />}
              />
              <Route exact path="/sandbox" element={<Sandbox />} />
              <Route exact path="/publish" element={<TopicPublisher />} />
            </Routes>
          </React.StrictMode>
          {user && user.email && <HelpDesk />}
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
