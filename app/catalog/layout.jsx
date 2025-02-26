import React from "react";

import Navbar from "@/components/Navigation/Navbar";

async function AdminLayout(props) {
  const { children } = props;

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "1440px" }}>
      <Navbar />
      {children}
    </div>
  );
}

export default AdminLayout;
