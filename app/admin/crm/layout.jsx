import React from "react";
import { cookies } from "next/headers";

import { getMeFromCookies } from "@/lib/me";
import Header from "@/app/admin/_components/Header";
import Footer from "@/app/admin/_components/Footer";

async function CrmLayout(props) {
  const { children } = props;

  const me = await getMeFromCookies(await cookies());

  return (
    <>
      <Header me={me} />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default CrmLayout;
