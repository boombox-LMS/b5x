import React, { useState } from "react";
import styled from "styled-components/macro";

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

const fillerMarkup = (
  <div>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
    <p>filler</p>
  </div>
);

const Layout = ({ sidebarIsOpen, sidebarContent, mainContent }) => {
  const [sidebarIsOpenState, setSidebarIsOpenState] = useState(sidebarIsOpen);

  let mainContentAreaCss = `
    padding: 30px;
    display: inline-block;
    vertical-align: top;
  `;

  let sidebarDrawerCss = `
    background-color: lightgray;
    display: inline-block;
    vertical-align: top;
    max-height: calc(100vh - ${stickyHeaderHeight});
    position: sticky;
    top: ${stickyHeaderHeight};
    overflow: auto;
  `;

  const layoutContainerCss = ``;

  if (!sidebarContent) {
    mainContentAreaCss += `width: 100vw;`;
  } else if (sidebarIsOpenState) {
    console.log("sidebar is open");
    mainContentAreaCss += `width: calc(100vw - ${openSidebarDrawerWidth});`;
    sidebarDrawerCss += `width: ${openSidebarDrawerWidth};`;
  } else if (!sidebarIsOpenState) {
    console.log("sidebar is closed");
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
                x
              </div>
              {sidebarContent}
            </div>
          ) : (
            <div
              onClick={() => {
                setSidebarIsOpenState(true);
              }}
            >
              -&gt;
            </div>
          )}
        </div>
      )}
      <div css={mainContentAreaCss}>{mainContent}</div>
    </div>
  );
};

export const Sandbox = () => {
  return (
    <Layout
      mainContent={fillerMarkup}
      sidebarContent={fillerMarkup}
      sidebarIsOpen={false}
    />
  );
};
