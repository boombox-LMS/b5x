import * as React from "react";
import styled from "styled-components/macro";

const sidebarDrawerIsOpen = false;

const Layout = () => {
  const layoutContainerCss = `
    height: 100%;
    position: relative;
  `;

  let mainContentAreaCss = `
    background-color: orange;
    padding: 30px;
    display: inline-block;
    vertical-align: top;
    min-height: 2000px;
    width: 70%;
  `;

  let sidebarDrawerCss = `
    background-color: green;
    width: 300px;
    display: inline-block;
    vertical-align: top;
    min-height: 95%;
    position: relative;
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
      <div css={sidebarDrawerCss}>SIDEBAR DRAWER</div>
      <div css={mainContentAreaCss}>MAIN CONTENT AREA</div>
    </div>
  );
};

export const Sandbox = () => {
  return <Layout />;
};
