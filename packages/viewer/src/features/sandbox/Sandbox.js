import * as React from "react";
import styled from "styled-components/macro";

const sidebarDrawerIsOpen = false;

const Layout = () => {
  const layoutContainerCss = `
    /* height: 100%; */
  `;

  let mainContentAreaCss = `
    background-color: orange;
    padding: 30px;
    display: inline-block;
    vertical-align: top;
    width: calc(100vw - 300px);
  `;

  let sidebarDrawerCss = `
    background-color: green;
    width: 300px;
    display: inline-block;
    vertical-align: top;
    max-height: calc(100vh - 35px);
    position: sticky;
    top: 35px;
    overflow: auto;
  `;

  const topHeaderCss = `
    background-color: blue;
    color: white;
    height: 75px;
    padding: 5px;
  `;

  const stickyHeaderCss = `
    background-color: red;
    color: white;
    height: 35px;
    padding: 5px;
    position: sticky;
    top: 0;
    z-index: 1;
  `;

  return (
    <div css={layoutContainerCss}>
      <div css={topHeaderCss}>TOP HEADER PORTION</div>
      <div css={stickyHeaderCss}>STICKY HEADER PORTION</div>
      <div css={sidebarDrawerCss}>
        SIDEBAR DRAWER
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
      <div css={mainContentAreaCss}>
        MAIN CONTENT AREA
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
    </div>
  );
};

export const Sandbox = () => {
  return <Layout />;
};
