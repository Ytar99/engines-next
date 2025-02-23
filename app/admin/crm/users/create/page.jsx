import Link from "next/link";
import React, { Suspense } from "react";

import UserCreateForm from "@/app/admin/_components/forms/UserCreateForm";

function UserCreatePage() {
  return (
    <>
      <h1>Создание нового пользователя</h1>

      <Suspense fallback={<div>Загрузка...</div>}>
        <UserCreateForm />
      </Suspense>

      <hr />
      <Link href="/admin/crm/users" className="btn">
        Вернуться
      </Link>
    </>
  );
}

export default UserCreatePage;
