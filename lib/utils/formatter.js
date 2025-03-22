export const clearPhone = (phone) => phone?.replace(/[^\d]/g, "").slice(0, 10) || "";

export const formatPhone = (phone) => {
  const cleaned = clearPhone(phone);
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : "";
};
