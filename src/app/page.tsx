import Header from "@/components/Header";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#F7F7F8] text-black overflow-hidden">
        <section className="px-5 sm:px-8 pt-36 sm:pt-44 pb-20">
          <div className="max-w-6xl mx-auto">
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <span className="border border-[#DDDEE3] bg-white rounded-full px-4 py-2 text-xs sm:text-sm text-[#6B6C72]">
                Gestão jurídica simples e eficiente
              </span>
            </div>

            {/* Conteúdo principal */}
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="font-semibold tracking-[-0.04em] leading-[1.05] text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                Tudo o que seu escritório
                <br className="hidden sm:block" />
                precisa em um só lugar.
              </h1>

              <p className="max-w-2xl mx-auto mt-6 text-[#74757B] text-base sm:text-lg leading-relaxed">
                Gerencie clientes, processos, prazos, documentos e finanças
                através de uma plataforma simples e organizada.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                <Link
                  href="/register"
                  className="w-full sm:w-auto bg-[#111116] text-white px-7 py-3.5 rounded-lg text-sm font-medium hover:bg-[#25252B] transition-colors"
                >
                  Começar agora
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto bg-white border border-[#DDDEE3] text-[#111116] px-7 py-3.5 rounded-lg text-sm font-medium hover:bg-[#F0F0F2] transition-colors"
                >
                  Acessar plataforma
                </Link>
              </div>
            </div>

            {/* Preview do produto */}
            <div className="relative max-w-5xl mx-auto mt-16 sm:mt-20">
              <div className="absolute -inset-10 bg-[#E6E6EA] blur-3xl opacity-60 rounded-full" />

              <div className="relative bg-white border border-[#DCDDE2] rounded-[22px] shadow-[0_20px_70px_rgba(0,0,0,0.08)] overflow-hidden">
                {/* Browser bar */}
                <div className="h-12 border-b border-[#E8E8EB] flex items-center px-5 gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D4D4D8]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D4D4D8]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D4D4D8]" />

                  <div className="hidden sm:block ml-5 bg-[#F5F5F6] rounded-md h-6 w-48" />
                </div>

                {/* Dashboard mockup */}
                <div className="grid grid-cols-1 md:grid-cols-[190px_1fr] min-h-105">
                  <aside className="hidden md:block border-r border-[#E8E8EB] bg-[#FAFAFB] p-5">
                    <p className="font-semibold text-sm mb-8">Law Hub</p>

                    <div className="space-y-3">
                      {[
                        "Dashboard",
                        "Processos",
                        "Clientes",
                        "Prazos",
                        "Documentos",
                        "Financeiro",
                      ].map((item, index) => (
                        <div
                          key={item}
                          className={`px-3 py-2 rounded-md text-xs ${
                            index === 0
                              ? "bg-[#EEEEF1] text-black font-medium"
                              : "text-[#85868C]"
                          }`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </aside>

                  <div className="p-5 sm:p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <p className="text-xs text-[#8A8B91] mb-1">
                          Visão geral
                        </p>
                        <h2 className="font-semibold text-xl">
                          Seu escritório
                        </h2>
                      </div>

                      <div className="bg-[#111116] text-white text-xs px-4 py-2 rounded-lg">
                        + Novo processo
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <DashboardCard label="Processos ativos" value="24" />
                      <DashboardCard label="Clientes" value="48" />
                      <DashboardCard label="Prazos" value="12" />
                    </div>

                    <div className="grid lg:grid-cols-[1.5fr_1fr] gap-3 mt-3">
                      <div className="border border-[#E4E4E7] rounded-xl p-5 min-h-47.5">
                        <p className="font-medium text-sm">
                          Processos recentes
                        </p>

                        <div className="mt-5 space-y-3">
                          <ProcessRow />
                          <ProcessRow />
                          <ProcessRow />
                        </div>
                      </div>

                      <div className="bg-[#111116] text-white rounded-xl p-5 min-h-47.5">
                        <p className="text-[#A8A8AE] text-xs">
                          Próximos prazos
                        </p>

                        <p className="text-3xl font-semibold mt-3">12</p>

                        <div className="border-t border-[#29292F] mt-6 pt-4">
                          <p className="text-xs text-[#A8A8AE]">Esta semana</p>
                          <p className="text-sm mt-1">5 compromissos</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function DashboardCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#E4E4E7] rounded-xl p-5 bg-white">
      <p className="text-[#818188] text-xs">{label}</p>
      <p className="text-2xl font-semibold mt-2">{value}</p>
    </div>
  );
}

function ProcessRow() {
  return (
    <div className="flex items-center justify-between border-b border-[#EEEEF0] pb-3">
      <div>
        <div className="w-24 sm:w-36 h-2 bg-[#DCDCE0] rounded-full" />
        <div className="w-16 sm:w-24 h-1.5 bg-[#EEEEF0] rounded-full mt-2" />
      </div>

      <div className="w-12 h-5 bg-[#F1F1F3] rounded-md" />
    </div>
  );
}
