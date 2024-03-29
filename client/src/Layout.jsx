import { Container } from "@mui/material";
import React from "react";

const Layout = ({ children }) => {
  return <Container maxWidth="xl">{children}</Container>;
};

export default Layout;
