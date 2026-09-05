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

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    general: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      name: "",
      email: "",
      password: "",
      general: "",
    };

    if (!form.name.trim()) {
      newErrors.name = "O nome é obrigatório";
    }

    if (!form.email.trim()) {
      newErrors.email = "O e-mail é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!form.password.trim()) {
      newErrors.password = "A senha é obrigatória";
    } else if (form.password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres";
    }

    if (newErrors.name || newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    setErrors({
      name: "",
      email: "",
      password: "",
      general: "",
    });

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({
          name: "",
          email: "",
          password: "",
          general: data.error || "Erro ao registrar",
        });
        return;
      }

      setErrors({
        name: "",
        email: "",
        password: "",
        general: "Conta criada com sucesso!",
      });
    } catch {
      setErrors({
        name: "",
        email: "",
        password: "",
        general: "Erro no servidor. Tente novamente.",
      });
    }
  };

  return (
    <>
      <HeaderLogo />

      <main className="min-h-dvh bg-[#F7F7F8] px-5 pb-10 pt-28 sm:px-8">
        <div className="mx-auto flex min-h-[calc(100dvh-9rem)] w-full max-w-6xl items-center justify-center">
          <div className="w-full max-w-120">
            {/* TOPO */}
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#111116] text-sm font-semibold text-white">
                LH
              </div>

              <p className="mb-2 text-sm text-[#8A8B91]">Comece no Law Hub</p>

              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111116] sm:text-4xl">
                Crie sua conta
              </h1>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#74757B]">
                Organize clientes, processos, prazos, documentos e finanças em
                um único lugar.
              </p>
            </div>

            {/* CARD */}
            <div className="rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-7">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* NOME */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                    Nome completo
                  </label>

                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    className={`h-11 w-full rounded-lg border bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8]
                      ${
                        errors.name
                          ? "border-red-400 focus:border-red-500"
                          : "border-[#DEDEE2] focus:border-[#BEBEC4] focus:bg-white"
                      }
                    `}
                  />

                  {errors.name && (
                    <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* ESCRITÓRIO */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                    Nome do escritório
                  </label>

                  <input
                    type="text"
                    placeholder="Ex: Miller Advocacia"
                    value={form.officeName}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        officeName: e.target.value,
                      })
                    }
                    className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8] focus:border-[#BEBEC4] focus:bg-white"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                    E-mail profissional
                  </label>

                  <input
                    type="email"
                    placeholder="voce@escritorio.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                    className={`h-11 w-full rounded-lg border bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8]
                      ${
                        errors.email
                          ? "border-red-400 focus:border-red-500"
                          : "border-[#DEDEE2] focus:border-[#BEBEC4] focus:bg-white"
                      }
                    `}
                  />

                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* TELEFONE */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                    Telefone / WhatsApp
                  </label>

                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value,
                      })
                    }
                    className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8] focus:border-[#BEBEC4] focus:bg-white"
                  />
                </div>

                {/* SENHA */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                    Senha
                  </label>

                  <input
                    type="password"
                    placeholder="Mínimo de 6 caracteres"
                    value={form.password}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password: e.target.value,
                      })
                    }
                    className={`h-11 w-full rounded-lg border bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8]
                      ${
                        errors.password
                          ? "border-red-400 focus:border-red-500"
                          : "border-[#DEDEE2] focus:border-[#BEBEC4] focus:bg-white"
                      }
                    `}
                  />

                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* MENSAGEM GERAL */}
                {errors.general && (
                  <div
                    className={`rounded-lg border px-4 py-3 text-sm ${
                      errors.general.includes("sucesso")
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-600"
                    }`}
                  >
                    {errors.general}
                  </div>
                )}

                {/* BUTTON */}
                <button
                  type="submit"
                  className="flex h-11 w-full items-center justify-center rounded-lg bg-[#111116] text-sm font-medium text-white transition-colors hover:bg-[#25252B]"
                >
                  Criar conta
                </button>
              </form>
            </div>

            {/* LOGIN */}
            <div className="mt-6 text-center">
              <p className="text-sm text-[#77787E]">
                Já possui uma conta?{" "}
                <Link
                  href="/login"
                  className="font-medium text-[#111116] transition hover:text-[#55565C]"
                >
                  Entrar
                </Link>
              </p>
            </div>

            {/* FOOTER */}
            <div className="mt-8 text-center">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#B0B1B6]">
                Law Hub
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
