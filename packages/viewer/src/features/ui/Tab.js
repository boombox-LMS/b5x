import React from "react";
import MuiTab from "@mui/material/Tab";
import { styled } from "@mui/material/styles";
import { muiTheme, themeSettings } from "../../theme/active-theme";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Tab = styled((props) => (
  <MuiTab disableRipple {...props} {...a11yProps(props.index)} />
))(({ theme }) => ({
  "&.Mui-selected": {
    color: themeSettings.selectedTabColor,
  },
  "&.Mui-focusVisible": {
    backgroundColor: themeSettings.selectedTabColor,
  },
}));

export default Tab;
