"use client";
import { useState } from "react";
import Header from "./Header";
import { ScrollProvider } from "./ScrollContext";

const Layout = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <ScrollProvider>
      <Header isVisible={isVisible} />
      {children}
    </ScrollProvider>
  );
};

export default Layout;
