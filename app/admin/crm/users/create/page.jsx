import CreateUserForm from "@/app/admin/_components/forms/CreateUserForm";
import Link from "next/link";
import React, { Suspense } from "react";

function UserCreatePage() {
  return (
    <>
      <h1>Создание нового пользователя</h1>
      {/* <?php if (isset($errorMessage)): ?> */}
      {/* <p style="color:red;"><?php echo htmlspecialchars($errorMessage); ?></p> */}
      {/* <?php endif; ?> */}

      <Suspense fallback={<div>Загрузка...</div>}>
        <CreateUserForm />
      </Suspense>

      <hr />
      <Link href="/admin/crm/users" className="btn">
        Вернуться
      </Link>
    </>
  );
}

export default UserCreatePage;
