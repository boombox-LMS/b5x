import React, { useState, useEffect } from "react";
import styled from "styled-components/macro";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { Tooltip } from "@mui/material";
import { Header } from "./header/Header";

const defaultOpenSidebarWidth = 300;
const logoHeight = 80;
const headerMenuHeight = 50;
const maxHeaderHeight = logoHeight + headerMenuHeight;

const SidebarDrawer = styled.div`
  height: calc(100vh - ${(props) => props.headerHeight}px);
  position: fixed;
  top: ${(props) => props.headerHeight}px;
  overflow: auto;
  transition: 0.4s;
  width: ${(props) => `${props.width}px`};
  padding-top: 30px;
  padding-left: 18px;
  z-index: 100;
  transform: translateX(
    ${(props) => (props.isOpen ? 0 : -(props.width + 5))}px
  );
`;

const MainContentArea = styled.div`
  padding-left: ${(props) => `calc(${props.currentSidebarWidth}px + 40px)`};
  padding-right: 40px;
  position: relative;
  top: 0px;
  left: 0px;
  display: block;
  transition: 0.4s;
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
  sidebarName = sidebarName || "";
  sidebarOpenIcon = sidebarOpenIcon || <ArrowForward />;
  openSidebarWidth = openSidebarWidth || defaultOpenSidebarWidth;
  const [sidebarIsOpenState, setSidebarIsOpenState] = useState(sidebarIsOpen);

  const [pageIsScrolled, setPageIsScrolled] = useState(false);
  const [headerIsHovered, setHeaderIsHovered] = useState(false);

  let currentHeaderHeight = headerMenuHeight;
  if (headerIsHovered || !pageIsScrolled) {
    currentHeaderHeight += logoHeight;
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

  let headerSpacerCss = `
    height: ${maxHeaderHeight}px;
    position: relative;
  `;

  let headerCss = `
    position: fixed;
    height: ${maxHeaderHeight}px;
    top: 0;
    background-color: white;
    width: calc(100% - 16px);
    transition: transform 0.4s;
    z-index: 100;
    margin-left: 8px;
    margin-right: 8px;
  `;

  if (!headerIsHovered && pageIsScrolled) {
    headerCss += `
      transform: translateY(-${logoHeight}px);
    `;
    headerSpacerCss += `
      transform: translateY(-${logoHeight}px);
    `;
  }

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
        headerCss={headerCss}
        logoHeight={logoHeight}
        menuHeight={headerMenuHeight}
        mouseEnterCallback={() => {
          setHeaderIsHovered(true);
        }}
        mouseLeaveCallback={() => {
          setHeaderIsHovered(false);
        }}
      />
      <div css={headerSpacerCss} />

      <MainContentArea
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
            <Tooltip title={`Show ${sidebarName}`}>{sidebarOpenIcon}</Tooltip>
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
              <ArrowBack />
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
