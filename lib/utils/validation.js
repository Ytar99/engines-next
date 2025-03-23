// utils/validation.js

import prisma from "@/lib/prisma";
import { clearPhone } from "@/lib/utils/formatter";

export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePhone = (phone) => !phone || /^\d{10}$/.test(phone);

export const validateProduct = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate || "article" in data) {
    if (!data.article?.trim()) errors.push("Артикул обязателен");
    else if (!/^[A-Z0-9-]{3,20}$/i.test(data.article)) errors.push("Неверный формат артикула");
  }

  if (!isUpdate || "name" in data) {
    if (!data.name?.trim()) errors.push("Название обязательно");
  }

  if ("price" in data) {
    if (isNaN(data.price) || parseFloat(data.price) <= 0) errors.push("Некорректная цена");
  }

  if ("count" in data) {
    if (isNaN(data.count) || parseInt(data.count) < 0) errors.push("Некорректное количество");
  }

  if ("engineId" in data && data.engineId) {
    if (isNaN(data.engineId)) errors.push("Некорректный ID двигателя");
  }

  return errors.length > 0 ? { valid: false, errors: errors.join(", ") } : { valid: true };
};

export const validateEngine = (data, isUpdate = false) => {
  const errors = [];

  if (!data.name?.trim()) {
    errors.push("Название обязательно");
  } else if (data.name.trim().length < 2) {
    errors.push("Название должно быть не менее 2 символов");
  }

  return errors.length > 0 ? { valid: false, errors: errors.join(", ") } : { valid: true };
};

export const validateCustomer = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate || "email" in data) {
    if (!data.email?.trim()) {
      errors.push("Email обязателен");
    } else if (!validateEmail(data.email)) {
      errors.push("Неверный формат email");
    }
  }

  if ("phone" in data && data.phone && !validatePhone(clearPhone(data.phone))) {
    errors.push("Телефон должен содержать 10 цифр");
  }

  return errors.length > 0 ? { valid: false, errors: errors.join(", ") } : { valid: true };
};

export const validateUser = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate || "email" in data) {
    if (!data.email?.trim()) errors.push("Email обязателен");
    else if (!validateEmail(data.email)) errors.push("Неверный формат email");
  }

  if ("phone" in data && data.phone && !validatePhone(clearPhone(data.phone))) {
    errors.push("Телефон должен содержать 10 цифр");
  }

  if (!isUpdate) {
    if (!data.password) errors.push("Пароль обязателен");
    if (data.password !== data.passwordConfirm) errors.push("Пароли не совпадают");
  }

  return errors.length > 0 ? { valid: false, errors: errors.join(", ") } : { valid: true };
};

// lib/utils/validation.js
export const validateOrder = (data, isUpdate = false) => {
  const errors = [];
  const statusOptions = ["NEW", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

  // Обязательные поля для создания и обновления
  if (!data.customerId) errors.push("Необходимо выбрать покупателя");

  if (!statusOptions.includes(data.status)) {
    errors.push("Неверный статус заказа");
  }

  // Валидация товаров
  if (!data.products || data.products.length === 0) {
    errors.push("Добавьте хотя бы один товар");
  } else {
    data.products.forEach((item, index) => {
      if (!item.productId) errors.push(`Товар #${index + 1}: не указан ID товара`);
      if (!item.count || item.count <= 0) errors.push(`Товар #${index + 1}: некорректное количество`);
    });
  }

  // Дополнительные проверки для создания
  if (!isUpdate) {
    if (!data.createdAt) errors.push("Не указана дата создания");
  }

  return errors.length > 0 ? { valid: false, errors: errors.join(", ") } : { valid: true };
};

// Расширенная версия с проверкой остатков
export const validateOrderWithStock = async (data) => {
  const baseValidation = validateOrder(data);
  if (!baseValidation.valid) return baseValidation;

  const stockErrors = [];

  // Проверка доступности товаров
  for (const item of data.products) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (!product) {
      stockErrors.push(`Товар ${item.productId} не найден`);
      continue;
    }

    if (product.count < item.count) {
      stockErrors.push(`${product.name}: запрошено ${item.count}, доступно ${product.count}`);
    }
  }

  return stockErrors.length > 0 ? { valid: false, errors: stockErrors.join(", ") } : { valid: true };
};
