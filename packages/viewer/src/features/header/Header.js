import React, { useState, useEffect } from "react";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import BarChartIcon from "@mui/icons-material/BarChart";
import TuneIcon from "@mui/icons-material/Tune";
import { useSelector } from "react-redux";
import { Tooltip } from "@mui/material";
import { LoadingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { LogOutButton } from "./LogOutButton";
import { EnvButton } from "./EnvButton";
import { useGetCurrentUserInfoQuery } from "../api/apiSlice";
import { selectHeaderProps } from "./headerSlice";
import Tab from "../ui/Tab";
import TabPanel from "../ui/TabPanel";
import Tabs from "../ui/Tabs";

export const Header = () => {
  const navigate = useNavigate();
  const headerProps = useSelector(selectHeaderProps);

  /*
  useEffect(() => {
    if (typeof window !== "undefined" && shrinkHeaderOnScroll === true) {
      window.addEventListener("scroll", () => {
        setSmall(window.pageYOffset > 100)
      })
    }
  }, [])
  */

  const {
    data: user,
    isLoading: userIsLoading,
    isSuccess: userLoadedSuccessfully,
    isError: userHasError,
    error: userError,
  } = useGetCurrentUserInfoQuery();

  if (userIsLoading) {
    return null;
  } else if (userHasError) {
    return <div>User fetch error: {JSON.stringify(userError)}</div>;
  }

  if (headerProps.isHidden) {
    return null;
  }

  const appPagesByName = {
    Home: {
      url: "/",
      tabIndex: 0,
    },
    "User profile": {
      url: `/users/${user.username}`,
      tabIndex: 1,
    },
    Dashboard: {
      url: "/dashboard",
      tabIndex: 2,
    },
    "Control panel": {
      url: "/control-panel",
      tabIndex: 3,
    },
  };

  const urlsInTabOrder = Object.values(appPagesByName).map((obj) => obj.url);

  let activeTabValue = false; // Required by MUI as an indicator that no tab is selected
  if (appPagesByName[headerProps.currentPage]) {
    activeTabValue = appPagesByName[headerProps.currentPage].tabIndex;
  }

  const handleTabChange = (event, value) => {
    navigate(urlsInTabOrder[value]);
  };

  const tabStyle = { minWidth: 20, paddingRight: 1, paddingLeft: 1 };
  const tabIconStyle = { fontSize: "1.7em" };

  return (
    <>
      <div
        className={`header__spacer ${
          headerProps.isMinimized ? "header__spacer--small" : ""
        }`}
      ></div>
      <div
        className={`header ${headerProps.isMinimized ? "header--small" : ""}`}
      >
        <div className="header__logo-container">
          <img className="header__logo-img" src="/img/cloudco.svg" />
        </div>
        <div className="header__content-container">
          <div className="header__left-menu">
            <Tabs
              value={activeTabValue}
              onChange={handleTabChange}
              sx={{
                marginBottom: "-6px",
                marginTop: "-16px",
              }}
            >
              <Tab
                sx={tabStyle}
                icon={
                  <Tooltip title="Home (Topic Catalog)" placement="top">
                    <HomeIcon sx={tabIconStyle} />
                  </Tooltip>
                }
                index={0}
              />
              <Tab
                sx={tabStyle}
                icon={
                  <Tooltip title="View user profile" placement="top">
                    <PersonIcon sx={tabIconStyle} />
                  </Tooltip>
                }
                index={1}
              />
              <Tab
                sx={tabStyle}
                icon={
                  <Tooltip title="Stats dashboard" placement="top">
                    <BarChartIcon sx={tabIconStyle} />
                  </Tooltip>
                }
                index={2}
              />
              <Tab
                sx={tabStyle}
                icon={
                  <Tooltip title="Admin control panel" placement="top">
                    <TuneIcon sx={tabIconStyle} />
                  </Tooltip>
                }
                index={3}
              />
              {/* <Tab label="Create highlight" index={3} /> */}
            </Tabs>
          </div>
          <div className="header__page-title">{headerProps.title || ""}</div>
          <div className="header__right-menu">
            <div
              style={{
                display: "inline-block",
                position: "relative",
                top: "-3.5px",
              }}
            >
              <span
                style={{
                  fontSize: "0.8em",
                  fontStyle: "italic",
                  marginRight: "3px",
                  color: "rgba(0, 0, 0, 0.6)",
                }}
              >
                {user.email}
              </span>
            </div>
            <LogOutButton />
          </div>
        </div>
      </div>
    </>
  );
};
