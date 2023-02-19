import React, { useState, useEffect } from "react";
import styled from "styled-components/macro";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { Tooltip } from "@mui/material";
import { Header } from "./header/Header";

const openSidebarDrawerWidth = "300px";
const closedSidebarDrawerWidth = "30px";
const logoHeight = 60;
const headerMenuHeight = 50;
const maxHeaderHeight = logoHeight + headerMenuHeight;

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

  let sidebarDrawerCss = `
    background-color: lightgray;
    display: inline-block;
    vertical-align: top;
    height: calc(100vh - ${currentHeaderHeight}px);
    position: sticky;
    top: ${currentHeaderHeight}px;
    overflow: auto;
    transition: 0.25s;
    width: ${
      sidebarIsOpenState ? openSidebarDrawerWidth : closedSidebarDrawerWidth
    };
    padding-top: 5px;
  `;

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
    transition: transform 0.25s;
  `;

  let headerCss = `
    position: fixed;
    height: ${maxHeaderHeight}px;
    top: 0;
    background-color: white;
    width: 100%;
    transition: transform 0.25s;
  `;

  if (!headerIsHovered && pageIsScrolled) {
    headerCss += `
      transform: translateY(-${logoHeight}px);
    `;
    headerSpacerCss += `
      transform: translateY(-${logoHeight}px);
    `;
  }

  let mainContentAreaCss = `
    padding-left: 30px;
    padding-right: 30px;
    display: inline-block;
    vertical-align: top;
    transition: width 0.25s;
  `;

  if (!sidebarContent) {
    mainContentAreaCss += `width: 100vw;`;
  } else if (sidebarIsOpenState) {
    mainContentAreaCss += `width: calc(100vw - ${openSidebarDrawerWidth});`;
  } else if (!sidebarIsOpenState) {
    mainContentAreaCss += `width: calc(100vw - ${closedSidebarDrawerWidth});`;
  }

  return (
    <div>
      <div css={headerSpacerCss} />
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
