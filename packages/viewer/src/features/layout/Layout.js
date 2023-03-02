import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components/macro";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { Tooltip } from "@mui/material";
import { Header } from "./header/Header";
import { muiTheme } from "../../theme";
import {
  DEFAULT_OPEN_SIDEBAR_WIDTH,
  HEADER_LOGO_HEIGHT,
  HEADER_MENU_HEIGHT,
  INACTIVE_MENU_ICON_COLOR,
  LAYOUT_RESIZE_TRANSITION_TIME,
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
  ${(props) =>
    props.isLoading ? "" : `transition: ${LAYOUT_RESIZE_TRANSITION_TIME};`}
  width: ${(props) => `${props.width}px`};
  padding-top: 55px;
  padding-left: 20px;
  z-index: 100;
  transform: translateX(
    ${(props) => (props.isOpen ? 0 : -(props.width + 5))}px
  );
`;

const MainContentArea = styled.div`
  padding-top: 22px;
  padding-left: ${(props) => `calc(${props.currentSidebarWidth}px + 55px)`};
  padding-right: 55px;
  position: relative;
  top: 0px;
  left: 0px;
  display: block;
  ${(props) =>
    props.isLoading ? "" : `transition: ${LAYOUT_RESIZE_TRANSITION_TIME};`}
  width: 100%;
`;

const SidebarShowHideIcon = styled.div`
  position: fixed;
  top: ${(props) => props.headerHeight + 30}px;
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

  const [sidebarIsScrolled, setSidebarIsScrolled] = useState(false);
  const [headerIsMinimized, setHeaderIsMinimized] = useState(false);
  const [isNewPage, setIsNewPage] = useState(false);

  let currentHeaderHeight = HEADER_MENU_HEIGHT;
  if (!headerIsMinimized) {
    currentHeaderHeight += HEADER_LOGO_HEIGHT;
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", () => {
        if (window.pageYOffset > 100 && !headerIsMinimized) {
          setHeaderIsMinimized(true);
        } else if (window.pageYOffset <= 100 && headerIsMinimized) {
          setHeaderIsMinimized(false);
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

  const handleSidebarScroll = (e) => {
    if (e.target.scrollTop === 0 && sidebarIsScrolled) {
      setSidebarIsScrolled(false);
    } else if (e.target.scrollTop > 0 && !sidebarIsScrolled) {
      setSidebarIsScrolled(true);
    }
  };

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
      <Header isMinimized={headerIsMinimized} />

      <MainContentArea
        isLoading={isNewPage}
        currentSidebarWidth={sidebarWidth}
        openSidebarWidth={openSidebarWidth}
      >
        {!sidebarIsOpenState && sidebarContent && (
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
        {sidebarIsOpenState && sidebarContent && !sidebarIsScrolled && (
          <SidebarShowHideIcon
            headerHeight={currentHeaderHeight}
            onClick={() => {
              setSidebarIsOpenState(false);
            }}
          >
            <Tooltip title={`Hide ${sidebarName}`}>
              <MenuIconWrapper>
                <ChevronLeft sx={{ fontSize: "1.8em", marginTop: "-2px" }} />
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
          onScroll={handleSidebarScroll}
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
