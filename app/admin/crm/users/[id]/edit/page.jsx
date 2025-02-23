import React, { Suspense } from "react";
import Link from "next/link";

import prisma from "@/lib/prisma";
import UserEditForm from "@/app/admin/_components/forms/UserEditForm";

async function UserEditPage({ params }) {
  const userId = (await params).id;

  const user = await prisma.user.findFirst({ where: { id: parseInt(userId) } });

  return (
    <>
      <h1>Редактирование пользователя</h1>

      <Suspense fallback={<div>Загрузка...</div>}>
        <UserEditForm user={user} />
      </Suspense>

      <hr />
      <Link href="/admin/crm/users" className="btn">
        Вернуться
      </Link>
    </>
  );
}

export default UserEditPage;
