import * as React from "react";
import styled from "styled-components/macro";

const sidebarDrawerIsOpen = false;
const sidebarDrawerWidth = "300px";
const topHeaderHeight = "75px";
const stickyHeaderHeight = "35px";

let sidebarDrawerCss = `
  background-color: green;
  width: ${sidebarDrawerWidth};
  display: inline-block;
  vertical-align: top;
  max-height: calc(100vh - ${stickyHeaderHeight});
  position: sticky;
  top: ${stickyHeaderHeight};
  overflow: auto;
`;

const topHeaderCss = `
  background-color: blue;
  color: white;
  height: ${topHeaderHeight};
  padding: 5px;
`;

const stickyHeaderCss = `
  background-color: red;
  color: white;
  height: ${stickyHeaderHeight};
  padding: 5px;
  position: sticky;
  top: 0;
  z-index: 1;
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

const Layout = ({ sidebarContent, mainContent }) => {
  let mainContentAreaCss = `
    background-color: orange;
    padding: 30px;
    display: inline-block;
    vertical-align: top;
  `;

  const layoutContainerCss = ``;

  if (!sidebarContent) {
    mainContentAreaCss += `width: 100vw;`;
  } else {
    mainContentAreaCss += `width: calc(100vw - ${sidebarDrawerWidth});`;
  }

  return (
    <div css={layoutContainerCss}>
      <div css={topHeaderCss}>TOP HEADER PORTION</div>
      <div css={stickyHeaderCss}>STICKY HEADER PORTION</div>
      {sidebarContent && <div css={sidebarDrawerCss}>{sidebarContent}</div>}
      <div css={mainContentAreaCss}>{mainContent}</div>
    </div>
  );
};

export const Sandbox = () => {
  return <Layout mainContent={fillerMarkup} sidebarContent={fillerMarkup} />;
};
