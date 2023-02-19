import React, { useState } from "react";
import styled from "styled-components/macro";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { Tooltip } from "@mui/material";

const openSidebarDrawerWidth = "300px";
const closedSidebarDrawerWidth = "30px";
const topHeaderHeight = "75px";
const stickyHeaderHeight = "35px";

const topHeaderCss = `
  height: ${topHeaderHeight};
  padding: 5px;
`;

const stickyHeaderCss = `
  height: ${stickyHeaderHeight};
  background-color: white;
  padding: 5px;
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: 1px solid black;
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

  let mainContentAreaCss = `
    padding: 30px;
    display: inline-block;
    vertical-align: top;
    transition: width 0.25s;
  `;

  let sidebarDrawerCss = `
    background-color: lightgray;
    display: inline-block;
    vertical-align: top;
    max-height: calc(100vh - ${stickyHeaderHeight});
    position: sticky;
    top: ${stickyHeaderHeight};
    overflow: auto;
    transition: width 0.25s;
    padding-top: 5px;
  `;

  const layoutContainerCss = ``;

  if (!sidebarContent) {
    mainContentAreaCss += `width: 100vw;`;
  } else if (sidebarIsOpenState) {
    mainContentAreaCss += `width: calc(100vw - ${openSidebarDrawerWidth});`;
    sidebarDrawerCss += `width: ${openSidebarDrawerWidth};`;
  } else if (!sidebarIsOpenState) {
    mainContentAreaCss += `width: calc(100vw - ${closedSidebarDrawerWidth});`;
    sidebarDrawerCss += `width: ${closedSidebarDrawerWidth};`;
  }

  return (
    <div css={layoutContainerCss}>
      <div css={topHeaderCss}>TOP HEADER PORTION</div>
      <div css={stickyHeaderCss}>STICKY HEADER PORTION</div>
      {sidebarContent && (
        <div css={sidebarDrawerCss}>
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
        </div>
      )}
      <div css={mainContentAreaCss}>{mainContent}</div>
    </div>
  );
};
