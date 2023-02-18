import * as React from "react";
import styled from "styled-components/macro";

const Layout = () => {
  const mainContentAreaCss = `
    outline: 2px solid orange;
    padding: 10px;
    padding-top: 30px;
  `;

  const sidebarDrawerCss = `
    outline: 2px solid green;
  `;

  const headerCss = `
    outline: 2px solid blue;
  `;

  return (
    <div>
      <div css={headerCss}>Header</div>
      <div css={sidebarDrawerCss}>Sidebar drawer</div>
      <div css={mainContentAreaCss}>Main content area</div>
    </div>
  );
};

export const Sandbox = () => {
  return <Layout />;
};
