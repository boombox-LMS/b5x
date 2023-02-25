import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components/macro";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { Tooltip } from "@mui/material";
import { Header } from "./header/Header";
import { muiTheme } from "../../theme";
import {
  DEFAULT_OPEN_SIDEBAR_WIDTH,
  HEADER_LOGO_HEIGHT,
  HEADER_MENU_HEIGHT,
  INACTIVE_MENU_ICON_COLOR,
} from "../../theme";

const MenuIconWrapper = styled.span`
  color: ${INACTIVE_MENU_ICON_COLOR};
  &:hover {
    color: ${muiTheme.palette.secondary.main};
  }
`;

const SidebarDrawer = styled.div`
  height: calc(100vh - ${(props) => props.headerHeight}px);
  position: fixed;
  top: ${(props) => props.headerHeight}px;
  overflow: auto;
  ${(props) => (props.isLoading ? "" : "transition: 0.4s;")}
  width: ${(props) => `${props.width}px`};
  padding-top: 30px;
  padding-left: 18px;
  z-index: 100;
  transform: translateX(
    ${(props) => (props.isOpen ? 0 : -(props.width + 5))}px
  );
`;

const MainContentArea = styled.div`
  padding-left: ${(props) => `calc(${props.currentSidebarWidth}px + 55px)`};
  padding-right: 55px;
  position: relative;
  top: 0px;
  left: 0px;
  display: block;
  ${(props) => (props.isLoading ? "" : "transition: 0.4s;")}
  width: 100%;
`;

const SidebarShowHideIcon = styled.div`
  position: fixed;
  top: ${(props) => props.headerHeight + 10}px;
  left: 16px;
  z-index: 1000;
  transition: 0.4s;
`;

export const Layout = ({
  sidebarIsOpen,
  openSidebarWidth,
  sidebarOpenIcon,
  sidebarContent,
  mainContent,
  sidebarName,
}) => {
  const location = useLocation();
  sidebarName = sidebarName || "";
  sidebarOpenIcon = sidebarOpenIcon || <ArrowForward />;
  openSidebarWidth = openSidebarWidth || DEFAULT_OPEN_SIDEBAR_WIDTH;
  const [sidebarIsOpenState, setSidebarIsOpenState] = useState(
    sidebarIsOpen || false
  );

  const [pageIsScrolled, setPageIsScrolled] = useState(false);
  const [headerIsHovered, setHeaderIsHovered] = useState(false);
  const [isNewPage, setIsNewPage] = useState(false);

  let currentHeaderHeight = HEADER_MENU_HEIGHT;
  if (headerIsHovered || !pageIsScrolled) {
    currentHeaderHeight += HEADER_LOGO_HEIGHT;
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", () => {
        if (window.pageYOffset > 100) {
          setPageIsScrolled(true);
        } else if (window.pageYOffset <= 100) {
          setPageIsScrolled(false);
        }
      });
    }
  }, []);

  useEffect(() => {
    setIsNewPage(true);
    // TODO: Brainstorm better ways to briefly suppress the CSS transitions
    // after route changes, since this timeout probably isn't flexible enough
    // for variable data load times etc.
    const timeout = setTimeout(() => {
      setIsNewPage(false);
    }, 1000);
  }, [location.pathname]);

  const headerIsMinimized = !headerIsHovered && pageIsScrolled;

  let sidebarWidth = 0;

  if (sidebarContent && sidebarIsOpenState) {
    sidebarWidth = openSidebarWidth;
  }

  return (
    <div
      css={`
        position: relative;
      `}
    >
      <Header
        isMinimized={headerIsMinimized}
        mouseEnterCallback={() => {
          setHeaderIsHovered(true);
        }}
        mouseLeaveCallback={() => {
          setHeaderIsHovered(false);
        }}
      />

      <MainContentArea
        isLoading={isNewPage}
        currentSidebarWidth={sidebarWidth}
        openSidebarWidth={openSidebarWidth}
      >
        {!sidebarIsOpenState && (
          <SidebarShowHideIcon
            headerHeight={currentHeaderHeight}
            onClick={() => {
              setSidebarIsOpenState(true);
            }}
          >
            <Tooltip title={`Show ${sidebarName}`}>
              <MenuIconWrapper>{sidebarOpenIcon}</MenuIconWrapper>
            </Tooltip>
          </SidebarShowHideIcon>
        )}
        {sidebarIsOpenState && (
          <SidebarShowHideIcon
            headerHeight={currentHeaderHeight}
            onClick={() => {
              setSidebarIsOpenState(false);
            }}
          >
            <Tooltip title={`Hide ${sidebarName}`}>
              <MenuIconWrapper>
                <ArrowBack />
              </MenuIconWrapper>
            </Tooltip>
          </SidebarShowHideIcon>
        )}
        <div
          css={`
            margin: 0 auto;
          `}
        >
          {mainContent}
        </div>
      </MainContentArea>

      {sidebarContent && (
        <SidebarDrawer
          isLoading={isNewPage}
          width={openSidebarWidth}
          isOpen={sidebarIsOpenState}
          headerHeight={currentHeaderHeight}
          sidebarIsOpen={sidebarIsOpenState}
        >
          <div>{sidebarContent}</div>
        </SidebarDrawer>
      )}
    </div>
  );
};
