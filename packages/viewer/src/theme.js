import { createTheme } from "@mui/material/styles";
import { demoVars } from "./themeOverrides/demoVars";

const CLOUDCO_MAIN_COLOR = "#004d80"; // midnight blue
const CLOUDCO_SECONDARY_COLOR = "#0297ed"; // medium sky blue

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: demoVars.primaryColor || CLOUDCO_MAIN_COLOR,
    },
    secondary: {
      main: demoVars.secondaryColor || CLOUDCO_SECONDARY_COLOR,
    },
    /*
    'Greenlit' coloring is used to indicate completion of a task.
    For example, a multiple-choice option that has been selected will be 'greenlit'
    to indicate the receipt of that selection action.
    
    Greenlit items are literally green by default, 
    regardless of the colors in the MUI theme.

    The dark color is generally used for borders and simple buttons, while the
    light color is used as a subtle background behind more delicate text/content.
    */
    greenlit: {
      main: "#008f0f",
      dark: "#008f0f",
      medium: "#2aa136",
      light: "#EBFDF0",
    },
    gray: {
      light: "#d6d6d6",
      medium: "#a19f9f",
    },
    /*
    'Shaded' coloring is used as a background color for a container that has dark text.
    It can also be used as a subtle highlight.
    */
    shaded: {
      main: "#f0f0f0", // very light gray
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

// in pixels
export const HEADER_LOGO_HEIGHT = 80;
export const HEADER_MENU_HEIGHT = 50;
export const MAX_HEADER_HEIGHT = HEADER_LOGO_HEIGHT + HEADER_MENU_HEIGHT;
export const DEFAULT_OPEN_SIDEBAR_WIDTH = 325;
export const INACTIVE_MENU_ICON_COLOR = "rgba(0, 0, 0, 0.6)";
export const LAYOUT_RESIZE_TRANSITION_TIME = "0.4s";
