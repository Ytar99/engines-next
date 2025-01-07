import prisma from "@/lib/prisma";
import Link from "next/link";
import React from "react";

async function UsersPage() {
  const users = await prisma.user.findMany();

  return (
    <>
      <h1>Пользователи</h1>
      <section className="actions-section">
        <div className="section-col">
          <Link href="/admin/crm/users/create" className="btn">
            Создать пользователя
          </Link>
        </div>
        <div className="section-col"></div>
      </section>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Роль</th>
            <th>Статус</th>
            <th>Имя</th>
            <th>Фамилия</th>
            <th>Телефон</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users?.length ? (
            users?.map((user) => (
              <tr key={`user-row-${user["id"]}`}>
                <td>{user["email"]}</td>
                <td>{user["role"]}</td>
                <td>{user["enabled"] == 1 ? "Активен" : "Отключен"}</td>
                <td>{user["firstname"]}</td>
                <td>{user["lastname"]}</td>
                <td>{user["phone"]}</td>
                <td>
                  <Link href={`/admin/crm/users/${user["id"]}/edit`} className="btn">
                    Редактировать
                  </Link>
                  <Link href={`/admin/crm/users/${user["id"]}/delete`} className="btn btn-danger">
                    Удалить
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">Нет пользователей.</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

export default UsersPage;
