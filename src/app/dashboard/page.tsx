"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const menuItems = [
  { key: "dashboard", label: "Início", icon: "/icons/dashboard.png" },
  { key: "processos", label: "Processos", icon: "/icons/processIcon.png" },
  { key: "clientes", label: "Clientes", icon: "/icons/clientsIcon.png" },
  { key: "prazos", label: "Prazos e Agenda", icon: "/icons/calendarIcon.png" },
  { key: "financeiro", label: "Financeiro", icon: "/icons/icons8-cifrão-100 (1).png" },
  { key: "documentos", label: "Documentos", icon: "/icons/documentsIcon.png" },
  { key: "config", label: "Configurações", icon: "/icons/configIcon.png" },
];

interface Case {
  _id?: string;
  title: string;
  number: string;
  status: string;
  court: string;
  createdAt?: string;
}

interface Client {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;    
  createdAt?: string;
}


export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [formData, setFormData] = useState<Case>({
    title: "",
    number: "",
    status: "",
    court: "",
  });
  const [cases, setCases] = useState<Case[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [filterText, setFilterText] = useState("");


  const [clients, setClients] = useState<Client[]>([]);
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [clientFormData, setClientFormData] = useState<Client>({
    name: "",
    email: "",
    phone: "",
    notes: "" 
  });


  const filteredCases = cases.filter(
    (proc) =>
      proc.title.toLowerCase().includes(filterText.toLowerCase()) ||
      proc.number.toLowerCase().includes(filterText.toLowerCase())
  );

  useEffect(() => {
    async function fetchCases() {
      const res = await fetch("/api/processes");
      const data = await res.json();
      setCases(data);
    }
    fetchCases();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const method = editingCase ? "PUT" : "POST";
    const url = editingCase ? `/api/processes/${editingCase._id}` : "/api/processes";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const updated = await res.json();

      if (editingCase) {

        setCases((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
        setEditingCase(null);
      } else {
        setCases((prev) => [...prev, updated]);
      }

      setShowForm(false);
      setFormData({ title: "", number: "", status: "", court: "" });
    } else {
      alert("Erro ao salvar processo.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente excluir este processo?")) return;

    const res = await fetch(`/api/processes/${id}`, { method: "DELETE" });

    if (res.ok) {
      setCases((prev) => prev.filter((c) => c._id !== id));
    } else {
      alert("Erro ao excluir processo.");
    }
  }

  function handleEdit(proc: Case) {
    setEditingCase(proc);
    setFormData(proc);
    setShowForm(true);
  }


  async function handleClientSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const method = editingClient ? "PUT" : "POST";
    const url = editingClient ? `/api/clients/${editingClient._id}` : "/api/clients";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientFormData),
    });

    if (res.ok) {
      const updated = await res.json();
      if (editingClient) {
        setClients((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
        setEditingClient(null);
      } else {
        setClients((prev) => [...prev, updated]);
      }
      setShowClientForm(false);
      setClientFormData({ name: "", email: "", phone: "" });
    } else {
      alert("Erro ao salvar cliente.");
    }
  }

  async function handleClientDelete(id: string) {
    if (!confirm("Deseja realmente excluir este cliente?")) return;
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (res.ok) {
      setClients((prev) => prev.filter((c) => c._id !== id));
    } else {
      alert("Erro ao excluir cliente.");
    }
  }

  function handleClientEdit(client: Client) {
    setEditingClient(client);
    setClientFormData(client);
    setShowClientForm(true);
  }


  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch("/api/clients");
        const data = await res.json();
        setClients(data);
      } catch (err) {
        console.error("Erro ao buscar clientes:", err);
      }
    }
    fetchClients();
  }, []);

  const renderContent = () => {
    switch (selectedPage) {
      case "processos":
        return (
          <section>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-2 text-black flex items-center gap-2">
                  <Image src="/icons/processIcon.png" alt="Processos" width={25} height={25} />
                  Processos
                </h2>
                <p className="text-gray-700">
                  Aqui você pode acompanhar e gerenciar todos os processos ativos do seu escritório.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilter((prev) => !prev)}
                  className="p-2 rounded-full hover:bg-gray-200 transition cursor-pointer"
                >
                  <Image src="/icons/filter.png" alt="Filtrar" width={30} height={30} title="Filtrar" />
                </button>

                <button
                  onClick={() => {
                    setShowForm(true);
                    setEditingCase(null);
                    setFormData({ title: "", number: "", status: "", court: "" });
                  }}
                  className="bg-black px-4 py-3 text-white rounded-lg cursor-pointer transition"
                >
                  Adicionar Processo
                </button>
              </div>
            </div>

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                showFilter ? "max-h-20 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-2"
              }`}
            >
              <input
                type="text"
                placeholder="Filtrar por título ou número..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="border p-2 rounded w-full mb-4"
              />
            </div>

            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="bg-white shadow-md rounded-lg p-6 mb-6 flex flex-col gap-3"
              >
                <h3 className="text-lg font-semibold text-black mb-2">
                  {editingCase ? "Editar Processo" : "Novo Processo"}
                </h3>
                <input
                  type="text"
                  placeholder="Título do processo"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Número do processo"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Tribunal"
                  value={formData.court}
                  onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                  className="border p-2 rounded"
                />
                <div className="flex gap-3">
                  <button type="submit" className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer">
                    {editingCase ? "Salvar Alterações" : "Salvar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingCase(null);
                      setFormData({ title: "", number: "", status: "", court: "" });
                    }}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCases.length === 0 ? (
                <p className="text-gray-600">Nenhum processo encontrado.</p>
              ) : (
                filteredCases.map((proc) => (
                  <div
                    key={proc._id}
                    className="bg-transparent rounded-2xl shadow-lg p-6 hover:shadow-md transition"
                  >
                    <p className="text-black font-semibold flex">
                      <Image
                        src={"/icons/iconFilesCases.png"}
                        className="mr-2 object-cover"
                        alt="Icon Files Cases"
                        width={15}
                        height={15}
                      />
                      {proc.title}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">Número: {proc.number}</p>
                    <p className="text-gray-500 text-sm mt-1">Status: {proc.status}</p>
                    <p className="text-gray-500 text-sm mt-1">Tribunal: {proc.court}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(proc)}
                        className="bg-black text-white px-3 py-1 rounded-lg transition cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(proc._id!)}
                        className="bg-black text-white px-3 py-1 rounded-lg  transition cursor-pointer"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        );

      case "clientes":
        return (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-black flex items-center gap-2">
                <Image src="/icons/clientsIcon.png" alt="Clientes" width={25} height={25} />
                Clientes
              </h2>

              <button
                onClick={() => {
                  setShowClientForm(true);
                  setEditingClient(null);
                  setClientFormData({ name: "", email: "", phone: "" });
                }}
                className="bg-black text-white px-4 py-3 rounded-lg  cursor-pointer transition"
              >
                Adicionar Cliente
              </button>
            </div>

            {showClientForm && (
              <form
                onSubmit={handleClientSubmit}
                className="bg-white shadow-md rounded-lg p-6 mb-6 flex flex-col gap-3"
              >
                <h3 className="text-lg font-semibold text-black mb-2">
                  {editingClient ? "Editar Cliente" : "Novo Cliente"}
                </h3>

                <input
                  type="text"
                  placeholder="Nome"
                  value={clientFormData.name}
                  onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                  className="border p-2 rounded"
                  required
                />
                <input
                  type="email"
                  placeholder="E-mail"
                  value={clientFormData.email}
                  onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })}
                  className="border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Telefone"
                  value={clientFormData.phone}
                  onChange={(e) => setClientFormData({ ...clientFormData, phone: e.target.value })}
                  className="border p-2 rounded"
                />


                <label className="text-sm text-gray-600">Observações</label>
                <textarea
                  placeholder="Observações sobre o cliente (ex: prefere WhatsApp, assunto, etc.)"
                  value={clientFormData.notes || ""}
                  onChange={(e) => setClientFormData({ ...clientFormData, notes: e.target.value })}
                  className="border p-2 rounded h-24 resize-none"
                />

                <div className="flex gap-3">
                  <button type="submit" className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer">
                    {editingClient ? "Salvar Alterações" : "Salvar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowClientForm(false);
                      setEditingClient(null);
                      setClientFormData({ name: "", email: "", phone: "" });
                    }}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clients.length === 0 ? (
                <p className="text-gray-600">Nenhum cliente encontrado.</p>
              ) : (
                clients.map((client) => (
                  <div
                    key={client._id}
                    className="bg-transparent rounded-2xl shadow-lg p-6 hover:shadow-md transition"
                  >
                    <p className="text-black font-semibold flex items-center gap-2">
                      <Image src="/icons/clientsIcon.png" alt="Cliente" width={20} height={20} />
                      {client.name}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">E-mail: {client.email}</p>
                    <p className="text-gray-500 text-sm mt-1">Telefone: {client.phone}</p>
                    {client.notes && (
                      <p className="text-gray-600 mt-2 whitespace-pre-line">{client.notes}</p>
                    )}
                    <div className="flex justify-between items-center">
                  
                      <div className=" flex gap-2 mt-3 ">
                        <button
                          onClick={() => handleClientEdit(client)}
                          className="bg-black text-white px-3 py-1 rounded-lg"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleClientDelete(client._id!)}
                          className="bg-black text-white px-3 py-1 rounded-lg "
                        >
                          Excluir
                        </button>
                      </div>
                      <div className="flex gap-1 items-center justify-between">
                        <Link
                          href={`https://wa.me/${client.phone?.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Abrir WhatsApp para ${client.name}`}
                        >
                          <Image src={'/icons/whatsIconClients.png'} alt="Whats Icon Clients" width={25} height={25}/>
                        </Link>

                        <Link
                          href={`mailto:${client.email}`}
                          aria-label={`Enviar e-mail para ${client.name}`}
                        >
                          <Image src={'/icons/emailIconClient.png'} alt="Email Icon Client" width={25} height={25}/>
                        </Link>

                      </div>
                    </div>
                    
                  </div>
                ))
              )}
            </div>
          </section>
      );

      case "prazos":
        return (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-black flex items-center gap-2">
              <Image src="/icons/calendarIcon.png" alt="Prazos" width={25} height={25} />
              Prazos e Agenda
            </h2>
            <p className="text-gray-700">Aqui ficam seus compromissos e prazos importantes.</p>
          </section>
        );

      default:
        return (
          <section>
            <h1 className="text-2xl font-semibold mb-2 text-black">Bem-vindo de volta!</h1>
            <p className="text-gray-600 mb-8">
              Aqui você acompanha tudo o que importa no seu escritório.
            </p>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-transparent rounded-2xl shadow-lg p-6 hover:shadow-md transition">
                <p className="text-black font-semibold flex">
                  <Image src={"/icons/calendarIcon.png"} alt="Calendar Icon" width={25} height={25} className="mr-1" />
                  Prazos de hoje
                </p>
                <p className="text-gray-500 text-sm mt-1">2 pendentes</p>
              </div>

              <div className="bg-transparent rounded-2xl shadow-lg p-6 hover:shadow-md transition">
                <p className="text-black font-semibold flex">
                  <Image src={"/icons/activeProcess.png"} alt="Active Process" width={25} height={25} className="mr-1" />
                  Processos ativos
                </p>
                <p className="text-gray-500 text-sm mt-1">14 em andamento</p>
              </div>

              <div className="bg-transparent rounded-2xl shadow-lg p-6 hover:shadow-md transition">
                <p className="text-black font-semibold flex">
                  <Image src={"/icons/clientsIcon.png"} alt="Clients Icon" width={25} height={25} className="mr-1" />
                  Clientes
                </p>
                <p className="text-gray-500 text-sm mt-1">8 cadastrados</p>
              </div>
            </section>
          </section>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">

      <aside
        className={`${
          menuOpen ? "w-56" : "w-20"
        } bg-transparent shadow-lg transition-all duration-300 flex flex-col items-center py-6 relative`}
      >
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="absolute top-6 left-6 flex flex-col justify-between w-7 h-5 group cursor-pointer z-50"
        >
          <span
            className={`h-[3px] w-full bg-black rounded transition-all duration-300 ${
              menuOpen ? "rotate-45 translate-y-[9px]" : ""
            }`}
          ></span>
          <span
            className={`h-[3px] w-full bg-black rounded transition-all duration-300 ${
              menuOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`h-[3px] w-full bg-black rounded transition-all duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-[8px]" : ""
            }`}
          ></span>
        </button>

        <div className="mt-16 flex flex-col items-center gap-6 w-full">
          {menuItems.map((item) => (
            <div
              key={item.key}
              onClick={() =>
                setSelectedPage(item.key === "dashboard" ? "" : item.key)
              }
              className={`relative group w-full flex cursor-pointer ${
                menuOpen ? "justify-start pl-6" : "justify-center"
              }`}
            >
              <div
                className={`flex items-center ${
                  menuOpen ? "gap-4 w-full justify-start" : "justify-center w-12"
                } h-12 rounded-xl hover:bg-gray-200 transition-all ${
                  selectedPage === item.key ? "bg-gray-200" : ""
                }`}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={27}
                  height={27}
                  style={{ objectFit: "contain" }}
                />
                {menuOpen && (
                  <span className="text-black text-sm font-medium">{item.label}</span>
                )}
              </div>
              {!menuOpen && (
                <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-black text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg">
                  {item.label}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>


      <main className="flex-1 p-8 transition-all">{renderContent()}</main>
    </div>
  );
}
