"use server";

import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

function validatePhone(phone) {
  // const phoneRegexp = /^(\+7|7|8)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/;
  const phoneRegexp = /^[0-9]{10}$/;
  return phoneRegexp.test(phone);
}

function validateEmail(email) {
  const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]{2,})*$/;
  return emailRegexp.test(email);
}

export async function createUser(prevState, formData) {
  const fields = {
    email: formData.get("email"),
    password: formData.get("password"),
    password_confirm: formData.get("password_confirm"),
    role: formData.get("role"),
    enabled: true,
    firstname: formData.get("firstname"),
    lastname: formData.get("lastname"),
    phone: formData.get("phone"),
  };

  if (!fields.email || !fields.password || !fields.password_confirm) {
    return { error: true, message: "Заполните все обязательные поля" };
  }

  if (fields?.password !== fields?.password_confirm) {
    return { error: true, message: "Пароли не совпадают" };
  }

  if (fields?.phone && !validatePhone(fields?.phone)) {
    return { error: true, message: "Неверный формат телефона, пример: XXXXXXXXXX" };
  }

  if (!validateEmail(fields?.email)) {
    return { error: true, message: "Неверный формат электронной почты" };
  }

  const isUserExists = await prisma.user.findUnique({
    where: { email: fields.email },
  });

  if (isUserExists) {
    return { error: true, message: "Пользователь с таким email уже существует" };
  }

  const hashedPassword = await bcrypt.hash(fields.password, 10);

  fields.password = hashedPassword;
  delete fields.password_confirm;

  const user = await prisma.user.create({ data: fields });

  if (!user) {
    return { error: true, message: "Произошла ошибка при создании пользователя" };
  }

  return { error: false, message: "Успех!" };
}

export async function editUser(prevState, formData) {
  const fields = {
    id: formData.get("id"),
    email: formData.get("email"),
    password: formData.get("password"),
    password_confirm: formData.get("password_confirm"),
    role: formData.get("role"),
    enabled: Boolean(formData.get("enabled") || false),
    firstname: formData.get("firstname"),
    lastname: formData.get("lastname"),
    phone: formData.get("phone"),
  };

  if (!fields.email) {
    return { error: true, message: "Заполните все обязательные поля" };
  }

  if (fields?.password !== fields?.password_confirm) {
    return { error: true, message: "Пароли не совпадают" };
  }

  if (fields?.phone && !validatePhone(fields?.phone)) {
    return { error: true, message: "Неверный формат телефона, пример: XXXXXXXXXX (10 цифр)" };
  }

  if (!validateEmail(fields?.email)) {
    return { error: true, message: "Неверный формат электронной почты" };
  }

  const userExist = await prisma.user.findUnique({
    where: { email: fields.email },
  });

  const isUserExists = Boolean(userExist);

  if (isUserExists && userExist.id !== parseInt(fields.id)) {
    return { error: true, message: "Пользователь с таким email уже существует" };
  }

  const hashedPassword = await bcrypt.hash(fields.password, 10);

  fields.password = hashedPassword;
  delete fields.password_confirm;
  delete fields.id;

  const user = await prisma.user.update({ data: fields, where: { email: fields.email } });

  if (!user) {
    return { error: true, message: "Произошла ошибка при обновлении пользователя" };
  }

  return { error: false, message: "Успех!" };
}

export async function deleteUser(prevState, formData) {
  const userId = formData.get("userId");

  if (!userId) {
    return { error: true, message: "Некорректный ID пользователя" };
  }

  const user = await prisma.user.delete({ where: { id: parseInt(userId) } });

  if (!user) {
    return { error: true, message: "Произошла ошибка при удалении пользователя" };
  }

  return { error: false, message: "Успех!" };
}
