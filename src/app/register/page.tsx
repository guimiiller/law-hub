"use client";

import { useState } from "react";
import Link from "next/link";
import HeaderLogo from "@/components/HeaderLogo";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    officeName: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(data.message || data.error);
  };

  return (
    <>
      <HeaderLogo />
      <div className="flex items-center justify-center h-screen px-4 bg-[linear-gradient(to_bottom,_#EFF0F5_0%,_#DADBE0_46%)]">
        <div className="border border-black shadow-xl rounded-2xl px-8 py-10 w-full max-w-lg text-slate-100">
          <h1 className="text-2xl font-semibold text-center mb-6 text-black">
            Crie sua conta
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Nome completo"
              className="w-full px-3 py-2 rounded-lg border border-black text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <input
              type="text"
              placeholder="Nome do escritório"
              className="w-full px-3 py-2 rounded-lg border border-black text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition"
              value={form.officeName}
              onChange={(e) => setForm({ ...form, officeName: e.target.value })}
            />

            <input
              type="email"
              placeholder="E-mail profissional"
              className="w-full px-3 py-2 rounded-lg border border-black text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <input
              type="tel"
              placeholder="Telefone / WhatsApp"
              className="w-full px-3 py-2 rounded-lg border border-black text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <input
              type="password"
              placeholder="Senha"
              className="w-full px-3 py-2 rounded-lg border border-black text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            <button
              type="submit"
              className="w-full bg-black  text-white py-2 rounded-lg font-medium transition cursor-pointer"
            >
              Registrar
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-slate-900">
              Já tem uma conta?{" "}
              <Link
                href="/login"
                className="text-slate-500 hover:text-slate-300 font-medium transition"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
