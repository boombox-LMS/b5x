import React, { useState, useEffect } from "react";
import styled from "styled-components/macro";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { Tooltip } from "@mui/material";
import { Header } from "./header/Header";

const openSidebarDrawerWidth = 300;
const closedSidebarDrawerWidth = 30;
const logoHeight = 80;
const headerMenuHeight = 50;
const maxHeaderHeight = logoHeight + headerMenuHeight;

const SidebarDrawer = styled.div`
  background-color: lightgray;
  display: inline-block;
  vertical-align: top;
  height: calc(100vh - ${(props) => props.headerHeight}px);
  position: sticky;
  top: ${(props) => props.headerHeight}px;
  overflow: auto;
  transition: 0.5s;
  width: ${(props) =>
    props.sidebarIsOpen
      ? `${openSidebarDrawerWidth}px`
      : `${closedSidebarDrawerWidth}px`};
  padding-top: 5px;
`;

const MainContentArea = styled.div`
  padding-left: 30px;
  padding-right: 30px;
  display: inline-block;
  vertical-align: top;
  transition: 0.5s;
  width: calc(100% - ${(props) => props.sidebarWidth}px);
`;

export const Layout = ({
  sidebarIsOpen,
  sidebarOpenIcon,
  sidebarContent,
  mainContent,
  sidebarName,
}) => {
  const [sidebarIsOpenState, setSidebarIsOpenState] = useState(sidebarIsOpen);
  sidebarName = sidebarName || "";

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
    transition: transform 0.5s;
  `;

  let headerCss = `
    position: fixed;
    height: ${maxHeaderHeight}px;
    top: 0;
    background-color: white;
    width: 100%;
    transition: transform 0.5s;
    z-index: 100;
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

  if (sidebarIsOpenState) {
    sidebarWidth = openSidebarDrawerWidth;
  } else if (!sidebarIsOpenState) {
    sidebarWidth = closedSidebarDrawerWidth;
  }

  return (
    <div>
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
      {sidebarContent && (
        <SidebarDrawer
          headerHeight={currentHeaderHeight}
          sidebarIsOpen={sidebarIsOpenState}
        >
          {sidebarIsOpenState ? (
            <div>
              <div
                onClick={() => {
                  setSidebarIsOpenState(false);
                }}
              >
                <Tooltip title={`Hide ${sidebarName}`}>
                  <ArrowBack />
                </Tooltip>
              </div>
              {sidebarContent}
            </div>
          ) : (
            <div
              onClick={() => {
                setSidebarIsOpenState(true);
              }}
            >
              <Tooltip title={`Show ${sidebarName}`}>{sidebarOpenIcon}</Tooltip>
            </div>
          )}
        </SidebarDrawer>
      )}
      <MainContentArea sidebarWidth={sidebarWidth}>
        {mainContent}
      </MainContentArea>
    </div>
  );
};
