import React, { useState, useEffect } from "react";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import BarChartIcon from "@mui/icons-material/BarChart";
import TuneIcon from "@mui/icons-material/Tune";
import { useSelector } from "react-redux";
import { Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { LogOutButton } from "./LogOutButton";
import { EnvButton } from "./EnvButton";
import { useGetCurrentUserInfoQuery } from "../../api/apiSlice";
import { selectHeaderProps } from "./headerSlice";
import Tab from "../../ui/Tab";
import Tabs from "../../ui/Tabs";
import PublishIcon from "@mui/icons-material/Publish";
import { demoVars } from "../../../themeOverrides/demoVars";
import styled from "styled-components/macro";

const TitleContainer = styled.div`
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 1px;
  font-size: 0.8em;
  text-align: center;
`;

const ContentContainer = styled.div`
  height: ${(props) => props.height}px;
  padding-top: 15px;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 5px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  width: 100%;
  border-bottom: 1px solid lightgray;
  font-size: 18px;
  z-index: 100;
`;

const LogoContainer = styled.div`
  width: 100%;
  text-align: center;
  padding-top: 10px;
  height: ${(props) => props.height}px;
`;

const RightMenuContainer = styled.div`
  justify-self: end;
`;

const LeftMenuContainer = styled.div`
  justify-self: start;
`;

export const Header = ({
  logoHeight,
  menuHeight,
  headerCss,
  mouseEnterCallback,
  mouseLeaveCallback,
}) => {
  const navigate = useNavigate();
  const headerProps = useSelector(selectHeaderProps);

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

  /*
  if (headerProps.isHidden) {
    return null;
  }
  */

  const tabStyle = { minWidth: 20, paddingRight: 1, paddingLeft: 1 };
  const tabIconStyle = { fontSize: "1.7em" };
  const headerLogoUrl = demoVars.headerLogoUrl || "/img/cloudco.svg";

  const appPagesByName = {
    Home: {
      url: "/",
      tabIndex: 0,
      title: "Home (Topic Catalog)",
      icon: <HomeIcon sx={tabIconStyle} />,
    },
    "User profile": {
      url: `/users/${user.username}`,
      tabIndex: 1,
      title: "User profile",
      icon: <PersonIcon sx={tabIconStyle} />,
    },
    Dashboard: {
      url: "/dashboard",
      tabIndex: 2,
      title: "Stats dashboard",
      icon: <BarChartIcon sx={tabIconStyle} />,
    },
    "Control panel": {
      url: "/control-panel",
      tabIndex: 3,
      title: "Admin control panel",
      icon: <TuneIcon sx={tabIconStyle} />,
    },
    "Publish a topic": {
      url: "/publish",
      tabIndex: 4,
      title: "Publish a topic",
      icon: <PublishIcon sx={tabIconStyle} />,
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

  return (
    <div
      css={headerCss}
      onMouseEnter={mouseEnterCallback}
      onMouseLeave={mouseLeaveCallback}
    >
      <LogoContainer height={logoHeight}>
        <img
          css={`
            height: calc(${logoHeight}px - 10px);
          `}
          src={headerLogoUrl}
        />
      </LogoContainer>
      <ContentContainer height={menuHeight}>
        <LeftMenuContainer>
          <Tabs
            value={activeTabValue}
            onChange={handleTabChange}
            sx={{
              marginBottom: "-6px",
              marginTop: "-16px",
            }}
          >
            {Object.values(appPagesByName).map((menuOption) => {
              return (
                <Tab
                  sx={tabStyle}
                  icon={
                    <Tooltip title={menuOption.title} placement="top">
                      {menuOption.icon}
                    </Tooltip>
                  }
                  index={menuOption.tabIndex}
                />
              );
            })}
          </Tabs>
        </LeftMenuContainer>
        <TitleContainer>
          {headerProps.title || "title goes here"}
        </TitleContainer>
        <RightMenuContainer>
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
        </RightMenuContainer>
      </ContentContainer>
    </div>
  );
};
