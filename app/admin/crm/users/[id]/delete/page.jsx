import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";

import prisma from "@/lib/prisma";
import DeleteUserForm from "@/app/admin/_components/forms/DeleteUserForm";

async function UserDeletePage({ params }) {
  const userId = (await params).id;

  if (!userId) {
    redirect("/admin/crm/users");
  }

  const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });

  if (!user) {
    return null;
  }

  return (
    <>
      <h1>Удаление пользователя</h1>
      <br />
      <p>Вы действительно хотите удалить пользователя {user?.email}?</p>

      <Suspense fallback={!user?.email}>
        <DeleteUserForm userId={userId} />
      </Suspense>

      <hr />
      <Link href="/admin/crm/users" className="btn">
        Вернуться
      </Link>
    </>
  );
}

export default UserDeletePage;
