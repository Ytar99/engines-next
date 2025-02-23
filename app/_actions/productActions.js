"use server";

import prisma from "@/lib/prisma";

export async function createProduct(prevState, formData) {
  const rawFields = {
    article: formData.get("article")?.trim(),
    name: formData.get("name")?.trim(),
    description: formData.get("description")?.trim(),
    price: formData.get("price"),
    count: formData.get("count"),
    engineId: formData.get("engineId"),
    img: formData.get("img")?.trim(),
  };

  const fields = {
    ...rawFields,
    price: parseFloat(rawFields.price),
    count: rawFields.count ? parseInt(rawFields.count) : 0,
    engineId: rawFields.engineId ? parseInt(rawFields.engineId) : null,
  };

  if (!rawFields.article || !rawFields.name || !rawFields.price) {
    return { data: fields, error: true, message: "Заполните все обязательные поля: артикул, название, цена" };
  }

  if (isNaN(fields.price) || fields.price <= 0) {
    return { data: fields, error: true, message: "Цена должна быть положительным числом" };
  }

  if (isNaN(fields.count) || fields.count < 0) {
    return { data: fields, error: true, message: "Количество должно быть неотрицательным целым числом" };
  }

  if (fields.engineId !== null && isNaN(fields.engineId)) {
    return { data: fields, error: true, message: "Неверный формат двигателя" };
  }

  const existingProduct = await prisma.product.findUnique({
    where: { article: rawFields.article },
  });

  if (existingProduct) {
    return { data: fields, error: true, message: "Продукт с таким артикулом уже существует" };
  }

  try {
    await prisma.product.create({
      data: {
        article: rawFields.article,
        name: rawFields.name,
        description: rawFields.description || null,
        price: fields.price,
        count: fields.count,
        engineId: fields.engineId,
        img: rawFields.img || null,
      },
    });
    return { data: fields, error: false, message: "Продукт успешно создан" };
  } catch (error) {
    console.error("Ошибка создания продукта:", error);
    return { data: fields, error: true, message: "Ошибка при создании продукта" };
  }
}

export async function editProduct(prevState, formData) {
  const rawFields = {
    id: formData.get("id"),
    article: formData.get("article")?.trim(),
    name: formData.get("name")?.trim(),
    description: formData.get("description")?.trim(),
    price: formData.get("price"),
    count: formData.get("count"),
    engineId: formData.get("engineId"),
    img: formData.get("img")?.trim(),
  };

  const fields = {
    ...rawFields,
    id: parseInt(rawFields.id),
    price: parseFloat(rawFields.price),
    count: rawFields.count ? parseInt(rawFields.count) : 0,
    engineId: rawFields.engineId ? parseInt(rawFields.engineId) : null,
  };

  if (isNaN(fields.id)) {
    return { error: true, message: "Неверный ID продукта" };
  }

  if (!rawFields.article || !rawFields.name || isNaN(fields.price)) {
    return { error: true, message: "Заполните все обязательные поля: артикул, название, цена" };
  }

  if (isNaN(fields.price) || fields.price <= 0) {
    return { error: true, message: "Цена должна быть положительным числом" };
  }

  if (isNaN(fields.count) || fields.count < 0) {
    return { error: true, message: "Количество должно быть неотрицательным целым числом" };
  }

  if (fields.engineId !== null && isNaN(fields.engineId)) {
    return { error: true, message: "Неверный формат двигателя" };
  }

  const existingProduct = await prisma.product.findUnique({
    where: { article: rawFields.article },
  });

  if (existingProduct && existingProduct.id !== fields.id) {
    return { error: true, message: "Продукт с таким артикулом уже существует" };
  }

  try {
    await prisma.product.update({
      where: { id: fields.id },
      data: {
        article: rawFields.article,
        name: rawFields.name,
        description: rawFields.description || null,
        price: fields.price,
        count: fields.count,
        engineId: fields.engineId,
        img: rawFields.img || null,
      },
    });
    return { error: false, message: "Продукт успешно обновлен" };
  } catch (error) {
    console.error("Ошибка обновления продукта:", error);
    return { error: true, message: "Ошибка при обновлении продукта" };
  }
}

export async function deleteProduct(prevState, formData) {
  const productId = formData.get("productId");

  if (!productId) {
    return { error: true, message: "Неверный ID продукта" };
  }

  try {
    await prisma.product.delete({
      where: { id: parseInt(productId) },
    });
    return { error: false, message: "Продукт успешно удален" };
  } catch (error) {
    console.error("Ошибка удаления продукта:", error);
    if (error.code === "P2003") {
      return { error: true, message: "Невозможно удалить продукт, так как он используется в заказах" };
    }
    return { error: true, message: "Ошибка при удалении продукта" };
  }
}
