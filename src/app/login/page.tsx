"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import HeaderLogo from "@/components/HeaderLogo";
import Link from "next/link";

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (res?.ok) {
      router.push("/dashboard");
    } else {
      alert("E-mail ou senha inválidos");
    }
  };

  return (
    <>
      <HeaderLogo />
      <div className="flex items-center justify-center h-screen bg-[linear-gradient(to_bottom,_#EFF0F5_0%,_#DADBE0_46%)] px-4">
        <div className="border border-black shadow-xl rounded-2xl px-8 py-10 w-full max-w-md text-slate-100">
          <h1 className="text-2xl font-semibold text-center mb-6 text-black">
            Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="E-mail"
              className="w-full px-3 py-2 rounded-lg border border-black text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
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
              disabled={loading}
              className="w-full bg-black  text-white py-2 rounded-lg font-medium transition cursor-pointer disabled:opacity-70"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-slate-900">
              Ainda não tem uma conta?{" "}
              <Link
                href="/register"
                className="text-slate-500 hover:text-slate-300 font-medium transition"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
