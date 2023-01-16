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
import { createTheme } from "@mui/material/styles";
import { Header } from "./features/header/Header";

const muiTheme = createTheme({
  palette: {
    primary: {
      main: "#004d80",
    },
    secondary: {
      main: "#008F0F",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Oxygen",
      "Ubuntu",
      "Cantarell",
      "Open Sans",
      "Helvetica Neue",
      "sans-serif",
    ].join(","),
  },
  components: {
    MuiTooltip: {
      styleOverrides: {
        arrow: {
          color: "#FFF",
        },
        tooltip: {
          backgroundColor: "#FFF",
          color: "black",
          boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          letterSpacing: "0.9px",
          fontSize: "1em",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "uppercase",
          fontSize: "0.85em",
          letterSpacing: "1px",
          fontWeight: 500,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontSize: "0.9em",
        },
      },
    },
  },
});

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
          <Header></Header>
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
            </Routes>
          </React.StrictMode>
          {user && user.email && <HelpDesk />}
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
