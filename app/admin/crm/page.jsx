import React from "react";
import { cookies } from "next/headers";

import { getMeFromCookies } from "@/lib/me";

async function CrmPage() {
  const me = await getMeFromCookies(await cookies());

  return (
    <>
      <h2>Добро пожаловать, {me?.firstname || me?.email || "незнакомец"}!</h2>
    </>
  );
}

export default CrmPage;
