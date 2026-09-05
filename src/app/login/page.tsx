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

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      email: "",
      password: "",
      general: "",
    };

    if (!form.email.trim()) {
      newErrors.email = "O e-mail é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!form.password.trim()) {
      newErrors.password = "A senha é obrigatória";
    }

    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    setErrors({
      email: "",
      password: "",
      general: "",
    });

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
      setErrors({
        email: "",
        password: "",
        general: "E-mail ou senha inválidos",
      });
    }
  };

  return (
    <>
      <HeaderLogo />

      <main className="h-screen overflow-hidden bg-[#F7F7F8] px-5 pt-24 pb-6 sm:px-8">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-center">
          <div className="w-full max-w-105">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#E1E1E5] bg-white shadow-sm">
                <span className="text-lg font-semibold tracking-[-0.04em] text-[#111116]">
                  LH
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111116]">
                Bem-vindo de volta
              </h1>

              <p className="mt-2 text-sm leading-relaxed text-[#77787E]">
                Entre na sua conta para acessar seu escritório.
              </p>
            </div>

            {/* Card */}
            <div className="rounded-2xl border border-[#E1E1E5] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:p-8">
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-[#25252A]"
                  >
                    E-mail
                  </label>

                  <input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                    className={`h-11 w-full rounded-lg border bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition-all placeholder:text-[#A6A7AC]
                      ${
                        errors.email
                          ? "border-red-400 focus:border-red-500"
                          : "border-[#DEDEE2] focus:border-[#A4A4AA] focus:bg-white"
                      }
                    `}
                  />

                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Senha */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-[#25252A]"
                    >
                      Senha
                    </label>

                    <span className="text-xs text-[#8A8B91]">Sua senha</span>
                  </div>

                  <input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password: e.target.value,
                      })
                    }
                    className={`h-11 w-full rounded-lg border bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition-all placeholder:text-[#A6A7AC]
                      ${
                        errors.password
                          ? "border-red-400 focus:border-red-500"
                          : "border-[#DEDEE2] focus:border-[#A4A4AA] focus:bg-white"
                      }
                    `}
                  />

                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Erro geral */}
                {errors.general && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3">
                    <p className="text-center text-xs text-red-600">
                      {errors.general}
                    </p>
                  </div>
                )}

                {/* Login */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-[#111116] px-5 text-sm font-medium text-white transition-colors hover:bg-[#25252B] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Entrando...
                    </span>
                  ) : (
                    "Entrar"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#E8E8EB]" />
                <span className="text-[11px] uppercase tracking-wider text-[#A0A1A6]">
                  Law Hub
                </span>
                <div className="h-px flex-1 bg-[#E8E8EB]" />
              </div>

              {/* Register */}
              <p className="text-center text-sm text-[#77787E]">
                Ainda não tem uma conta?{" "}
                <Link
                  href="/register"
                  className="font-medium text-[#111116] transition-opacity hover:opacity-60"
                >
                  Criar conta
                </Link>
              </p>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-xs text-[#A0A1A6]">
              Gerencie seu escritório de forma simples e organizada.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
