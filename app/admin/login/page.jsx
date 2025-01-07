"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation"; // Импортируйте useRouter

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter(); // Инициализируйте router

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();

      // Здесь перенаправим пользователя на страницу CRM после успешного входа
      router.push("/admin/crm");
    } else {
      const errorData = await res.json();
      console.warn("Login error: ", errorData);
      toast.error(errorData.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Пароль"
        required
      />
      <button type="submit">Войти</button>
    </form>
  );
}
