import * as React from "react";
import styled from "styled-components/macro";

const Layout = () => {
  const layoutContainerCss = `
    height: 100%;
  `;

  const mainContentAreaCss = `
    outline: 2px solid orange;
    padding: 10px;
    padding-top: 30px;
    display: inline-block;
    vertical-align: top;
    width: calc(100% - 300px);
    min-height: 95%;
  `;

  const sidebarDrawerCss = `
    outline: 2px solid green;
    width: 300px;
    display: inline-block;
    vertical-align: top;
    min-height: 95%;
  `;

  const headerCss = `
    outline: 2px solid blue;
  `;

  return (
    <div css={layoutContainerCss}>
      <div css={headerCss}>Header</div>
      <div css={sidebarDrawerCss}>Sidebar drawer</div>
      <div css={mainContentAreaCss}>Main content area</div>
    </div>
  );
};

export const Sandbox = () => {
  return <Layout />;
};
