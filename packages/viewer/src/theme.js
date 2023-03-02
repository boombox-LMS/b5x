import { createTheme } from "@mui/material/styles";

// literal colors
const CLOUDCO_DARK_BLUE = "#004d80";
const CLOUDCO_MEDIUM_BLUE = "#0297ed";
const DARK_GREEN = "#008f0f";
const MEDIUM_GREEN = "#2aa136";
const LIGHT_GREEN = "#EBFDF0";
const VERY_BRIGHT_RED = "#FF0000";
const LIGHT_SHADING = "#f0f0f0";
const WHITE = "#FFF";
const HARD_BLACK = "#000";
const SOFT_BLACK = "#222222";

// TODO: Allow overrides from theme-customization.js
export const themeSettings = {
  // layout dimensions
  headerLogoAreaHeight: 80, // px
  headerMenuHeight: 50, // px
  defaultOpenSidebarWidth: 325, // px

  // layout behavior
  layoutResizeTransitionTime: "0.4s",

  // branding
  faviconUrl: "cloudco_favicon.svg",
  headerLogoUrl: "/img/cloudco.svg",

  // abstract palettes

  // MUI colors
  muiPalette: {
    primary: CLOUDCO_DARK_BLUE,
    secondary: CLOUDCO_MEDIUM_BLUE,
  },

  // grays -- more to be added here
  grayPalette: {
    light: "#d6d6d6",
    medium: "#a19f9f",
  },

  // greenlighting
  /*
    'Greenlit' coloring is used to indicate completion of a task.
    For example, a multiple-choice option that has been selected will be 'greenlit'
    to indicate the receipt of that selection action.
    
    Greenlit items are literally green by default, 
    regardless of the colors in the MUI theme.

    The dark color is generally used for borders and simple buttons, while the
    light color is used as a subtle background behind more delicate text/content.
  */
  greenlitPalette: {
    main: DARK_GREEN,
    light: LIGHT_GREEN,
    medium: MEDIUM_GREEN,
    dark: DARK_GREEN,
  },

  // flagging very serious errors/warnings
  criticalPalette: {
    main: VERY_BRIGHT_RED,
  },

  shadingPalette: {
    main: LIGHT_SHADING,
  },

  // colors of specific entities
  inactiveMenuIconColor: "rgba(0, 0, 0, 0.6)", // TODO: This is the MUI default color for an inactive tab, need to find it in the muiTheme
  selectedTabColor: CLOUDCO_MEDIUM_BLUE,
  topicPriorityLevelRibbon: {
    backgroundColor: CLOUDCO_MEDIUM_BLUE,
    iconColor: WHITE,
  },
  focusedInputBorderColor: CLOUDCO_MEDIUM_BLUE,

  // MUI fonts
  muiTypography: {
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
};

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: themeSettings.muiPalette.primary,
    },
    secondary: {
      main: themeSettings.muiPalette.secondary,
    },
    greenlit: {
      main: themeSettings.greenlitPalette.main,
      dark: themeSettings.greenlitPalette.dark,
      medium: themeSettings.greenlitPalette.medium,
      light: themeSettings.greenlitPalette.light,
    },
    gray: {
      light: themeSettings.grayPalette.light,
      medium: themeSettings.grayPalette.medium,
    },
    critical: {
      main: themeSettings.criticalPalette.main,
    },
    /*
    'Shaded' coloring is used as a background color for a container that has dark text.
    It can also be used as a subtle highlight.
    */
    shaded: {
      main: themeSettings.shadingPalette.main,
    },
  },
  typography: {
    fontFamily: themeSettings.muiTypography.fontFamily,
  },
  components: {
    MuiTooltip: {
      styleOverrides: {
        arrow: {
          color: WHITE,
        },
        tooltip: {
          backgroundColor: WHITE,
          color: HARD_BLACK,
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
export const LAYOUT_RESIZE_TRANSITION_TIME = "0.4s";

// colors
export const INACTIVE_MENU_ICON_COLOR = "rgba(0, 0, 0, 0.6)";
export const TOPIC_CARD_RIBBON_COLOR = muiTheme.palette.secondary.main;
export const FOCUSED_INPUT_BORDER_COLOR = muiTheme.palette.secondary.main;
