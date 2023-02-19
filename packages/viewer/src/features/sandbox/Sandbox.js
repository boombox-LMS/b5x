import React from "react";
import { Layout } from "../layout/Layout";
import ListIcon from "@mui/icons-material/List";

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

export const Sandbox = () => {
  return (
    <Layout
      mainContent={fillerMarkup}
      sidebarContent={fillerMarkup}
      sidebarIsOpen={false}
      sidebarOpenIcon={<ListIcon />}
    />
  );
};
