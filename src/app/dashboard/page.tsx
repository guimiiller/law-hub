"use client";


import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { signOut } from "next-auth/react";


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
  clientId?: { _id: string; name: string } | string;
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

type Deadline = {
  _id: string;
  title: string;
  date: string;
  description?: string;
  processId?: string;
  status?: "pendente" | "concluído";
};

interface FinanceFormData {
  type: string;
  description: string;
  value: number;
  date: string;
}

interface DocumentFormData {
  title: string;
  type: string;
  client: string;
  clientId: string;
  processId: string;
  url: string;
  description: string;
  tags: string[];
  file: File | null;
  date: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();


  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [formData, setFormData] = useState<Case>({
    title: "",
    number: "",
    status: "",
    court: "",
    clientId: "", 
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

    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [showDeadlineForm, setShowDeadlineForm] = useState(false);
    const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
    const [deadlineFormData, setDeadlineFormData] = useState({
      title: "",
      date: "",
      description: "",
      processId: "",
      status: "pendente",
    });

    const [stats, setStats] = useState({
      totalClients: 0,
      totalCases: 0,
      totalDeadlines: 0,
    });

    const [finances, setFinances] = useState<any[]>([]);
    const [showFinanceForm, setShowFinanceForm] = useState(false);
    const [editingFinance, setEditingFinance] = useState<any | null>(null);
    const [financeFormData, setFinanceFormData] = useState<FinanceFormData>({
      type: "entrada",
      description: "",
      value: 0,
      date: "",
    });

    const initialDocumentFormData: DocumentFormData = {
      title: "",
      type: "",
      client: "",
      clientId: "",
      processId: "",
      url: "",
      description: "",
      tags: [],
      file: null,
      date: "",
    };


    const [documents, setDocuments] = useState<any[]>([]);
    const [showDocumentForm, setShowDocumentForm] = useState(false);
    const [editingDocument, setEditingDocument] = useState<any | null>(null);
    const [documentFormData, setDocumentFormData] = useState<DocumentFormData>(initialDocumentFormData);



    async function handleDocumentSubmit(e: React.FormEvent) {
      e.preventDefault();

      const method = editingDocument ? "PUT" : "POST";
      const url = editingDocument
        ? `/api/documents/${editingDocument._id}`
        : "/api/documents";


      const formData = new FormData();
      formData.append("title", documentFormData.title);
      formData.append("type", documentFormData.type);
      formData.append("description", documentFormData.description);
      formData.append("tags", documentFormData.tags.join(","));
      formData.append("clientId", documentFormData.clientId || "");
      formData.append("processId", documentFormData.processId || "");

      if (documentFormData.file) {
        formData.append("file", documentFormData.file);
      }

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        alert("Erro ao salvar documento.");
        return;
      }

      const saved = await res.json();

      if (editingDocument) {
        setDocuments((prev) =>
          prev.map((d) => (d._id === saved._id ? saved : d))
        );
      } else {
        setDocuments((prev) => [...prev, saved]);
      }

      setShowDocumentForm(false);
      setEditingDocument(null);
      setDocumentFormData(initialDocumentFormData);
    }


    function handleDocumentEdit(doc: any) {
      setEditingDocument(doc);
      setDocumentFormData({
        title: doc.title || "",
        type: doc.type || "",
        client: doc.client || "",
        clientId: doc.clientId || "",
        processId: doc.processId || "",
        url: doc.url || "",
        description: doc.description || "",
        tags: doc.tags || [],
        file: null,
        date: doc.date?.slice(0, 10) || "",
      });

      setShowDocumentForm(true);
    }


    async function handleDocumentDelete(id: string) {
      if (!confirm("Tem certeza que deseja excluir este documento?")) return;

      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });

      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d._id !== id));
      } else {
        alert("Erro ao excluir documento.");
      }
    }

    useEffect(() => {
      async function fetchDocuments() {
        try {
          const res = await fetch("/api/documents");
          const data = await res.json();
          setDocuments(data);
        } catch (err) {
          console.error("Erro ao buscar documentos", err);
        }
      }

      fetchDocuments();
    }, []);


    useEffect(() => {
      async function fetchDashboardData() {
        try {
          const [casesRes, clientsRes, deadlinesRes] = await Promise.all([
            fetch("/api/processes"),
            fetch("/api/clients"),
            fetch("/api/deadlines"),
          ]);

          const [casesData, clientsData, deadlinesData] = await Promise.all([
            casesRes.json(),
            clientsRes.json(),
            deadlinesRes.json(),
          ]);

          setStats({
            totalClients: clientsData.length,
            totalCases: casesData.length,
            totalDeadlines: deadlinesData.length,
          });
        } catch (err) {
          console.error("Erro ao carregar dados do dashboard:", err);
        }
      }

      fetchDashboardData();
    }, []);

    useEffect(() => {
      async function fetchDeadlines() {
        const res = await fetch("/api/deadlines");
        const data = await res.json();
        setDeadlines(data);
      }
      fetchDeadlines();
    }, []);

    async function handleDeadlineSubmit(e: React.FormEvent) {
      e.preventDefault();
      const method = editingDeadline ? "PUT" : "POST";
      const url = editingDeadline ? `/api/deadlines/${editingDeadline._id}` : "/api/deadlines";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deadlineFormData),
      });

      if (res.ok) {
        const updated = await res.json();
        if (editingDeadline) {
          setDeadlines((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
          setEditingDeadline(null);
        } else {
          setDeadlines((prev) => [...prev, updated]);
        }
        setShowDeadlineForm(false);
        setDeadlineFormData({ title: "", date: "", description: "", processId: "", status: "pendente" });
      } else {
        alert("Erro ao salvar prazo.");
      }
    }

    async function handleDeadlineDelete(id: string) {
      if (!confirm("Deseja realmente excluir este prazo?")) return;
      const res = await fetch(`/api/deadlines/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeadlines((prev) => prev.filter((p) => p._id !== id));
      } else {
        alert("Erro ao excluir prazo.");
      }
    }

    function handleDeadlineEdit(prazo: Deadline) {
      setEditingDeadline(prazo);
      setDeadlineFormData({
        title: prazo.title,
        date: prazo.date.slice(0, 16),
        description: prazo.description || "",
        processId: prazo.processId || "",
        status: prazo.status || "pendente",
      });
      setShowDeadlineForm(true);
    }


    const calendarEvents = deadlines.map((prazo) => ({
      id: prazo._id,
      title: prazo.title,
      start: prazo.date,
      backgroundColor: prazo.status === "concluído" ? "#16a34a" : "#dc2626",
      borderColor: prazo.status === "concluído" ? "#16a34a" : "#dc2626",
    }));

    function getUrgencyLevel(date: string) {
      const now = new Date();
      const deadlineDate = new Date(date);

      const diffTime = deadlineDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return "late";
      if (diffDays <= 2) return "urgent";
      if (diffDays <= 5) return "warning";
      return "normal";
    }



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

  useEffect(() => {
    async function fetchFinances() {
      try {
        const res = await fetch("/api/finances");
        const data = await res.json();
        setFinances(data);
      } catch (err) {
        console.error("Erro ao buscar registros financeiros:", err);
      }
    }
    fetchFinances();
  }, []);

  async function handleFinanceSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editingFinance ? "PUT" : "POST";
    const url = editingFinance ? `/api/finances/${editingFinance._id}` : "/api/finances";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(financeFormData),
    });

    if (res.ok) {
      const updated = await res.json();
      if (editingFinance) {
        setFinances((prev) => prev.map((f) => (f._id === updated._id ? updated : f)));
        setEditingFinance(null);
      } else {
        setFinances((prev) => [...prev, updated]);
      }
      setShowFinanceForm(false);
      setFinanceFormData({ type: "entrada", description: "", value: 0, date: "" });
    } else {
      alert("Erro ao salvar registro financeiro.");
    }
  }

  function handleFinanceEdit(item: any) {
    setEditingFinance(item);
    setFinanceFormData({
      type: item.type,
      description: item.description,
      value: item.value,
      date: item.date.slice(0, 10),
    });
    setShowFinanceForm(true);
  }

  async function handleFinanceDelete(id: string) {
    if (!confirm("Deseja realmente excluir este registro?")) return;
    const res = await fetch(`/api/finances/${id}`, { method: "DELETE" });
    if (res.ok) {
      setFinances((prev) => prev.filter((f) => f._id !== id));
    } else {
      alert("Erro ao excluir registro financeiro.");
    }
  }

    useEffect(() => {
    if (status === "unauthenticated") {
        router.replace("/login");
      }
    }, [status, router]);

    if (status === "loading") {
      return (
        <div className="h-screen flex items-center justify-center">
          <p>Carregando...</p>
        </div>
      );
    }

    if (!session) {
      return null;
    }

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

                <select
                  value={typeof formData.clientId === "object" ? formData.clientId._id : formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="border p-2 rounded"
                >
                  <option value="">Selecione o Cliente</option>

                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>


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
                    <p><strong>Cliente:</strong> 
                      {typeof proc.clientId === "string" 
                        ? "Carregando..." 
                        : proc.clientId?.name}
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-black flex items-center gap-2">
                  <Image src="/icons/calendarIcon.png" alt="Prazos" width={25} height={25} />
                  Prazos e Agenda
                </h2>
                <button
                  onClick={() => {
                    setShowDeadlineForm(true);
                    setEditingDeadline(null);
                    setDeadlineFormData({
                      title: "",
                      date: "",
                      description: "",
                      processId: "",
                      status: "pendente",
                    });
                  }}
                  className="bg-black text-white px-4 py-3 rounded-lg cursor-pointer transition"
                >
                  Adicionar Prazo
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-md p-4 mb-8">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  locale="pt-br"
                  events={calendarEvents}
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                  }}
                  eventClick={(info) => {
                    const prazo = deadlines.find((d) => d._id === info.event.id);
                    if (prazo) {
                      handleDeadlineEdit(prazo);
                    }
                  }}
                  height="auto"
                />
              </div>


              {showDeadlineForm && (
                <form
                  onSubmit={handleDeadlineSubmit}
                  className="bg-white shadow-md rounded-lg p-6 mb-6 flex flex-col gap-3"
                >
                  <h3 className="text-lg font-semibold text-black mb-2">
                    {editingDeadline ? "Editar Prazo" : "Novo Prazo"}
                  </h3>

                  <input
                    type="text"
                    placeholder="Título"
                    value={deadlineFormData.title}
                    onChange={(e) => setDeadlineFormData({ ...deadlineFormData, title: e.target.value })}
                    className="border p-2 rounded"
                    required
                  />
                  <input
                    type="datetime-local"
                    value={deadlineFormData.date}
                    onChange={(e) => setDeadlineFormData({ ...deadlineFormData, date: e.target.value })}
                    className="border p-2 rounded"
                    required
                  />
                  <textarea
                    placeholder="Descrição"
                    value={deadlineFormData.description}
                    onChange={(e) => setDeadlineFormData({ ...deadlineFormData, description: e.target.value })}
                    className="border p-2 rounded h-24 resize-none"
                  />
                  <select
                    value={deadlineFormData.status}
                    onChange={(e) => setDeadlineFormData({ ...deadlineFormData, status: e.target.value })}
                    className="border p-2 rounded"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="concluído">Concluído</option>
                  </select>

                  <div className="flex gap-3">
                    <button type="submit" className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer">
                      {editingDeadline ? "Salvar Alterações" : "Salvar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeadlineForm(false);
                        setEditingDeadline(null);
                        setDeadlineFormData({ title: "", date: "", description: "", processId: "", status: "pendente" });
                      }}
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deadlines.length === 0 ? (
                  <p className="text-gray-600">Nenhum prazo cadastrado.</p>
                ) : (
                  deadlines.map((prazo) => {
                    const urgency = getUrgencyLevel(prazo.date);

                    return (
                      <div
                        key={prazo._id}
                        className={`rounded-2xl shadow-lg p-6 transition border-l-4 hover:shadow-md
                          ${
                            urgency === "late"
                              ? "border-red-600 bg-red-50"
                              : urgency === "urgent"
                              ? "border-orange-500 bg-orange-50"
                              : urgency === "warning"
                              ? "border-yellow-500 bg-yellow-50"
                              : "border-gray-200 bg-white"
                          }
                        `}
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-black font-semibold flex items-center gap-2">
                            <Image src="/icons/calendarIcon.png" alt="Prazo" width={20} height={20} />
                            {prazo.title}
                          </p>

                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full
                              ${
                                urgency === "late"
                                  ? "bg-red-600 text-white"
                                  : urgency === "urgent"
                                  ? "bg-orange-500 text-white"
                                  : urgency === "warning"
                                  ? "bg-yellow-400 text-black"
                                  : "bg-gray-200 text-gray-700"
                              }
                            `}
                          >
                            {urgency === "late"
                              ? "ATRASADO"
                              : urgency === "urgent"
                              ? "URGENTE"
                              : urgency === "warning"
                              ? "ATENÇÃO"
                              : "NO PRAZO"}
                          </span>
                        </div>

                        <p className="text-gray-500 text-sm mt-1">
                          Data: {new Date(prazo.date).toLocaleString("pt-BR")}
                        </p>

                        <p className="text-gray-500 text-sm mt-1">
                          Status: {prazo.status}
                        </p>

                        {prazo.description && (
                          <p className="text-gray-600 mt-2 whitespace-pre-line">
                            {prazo.description}
                          </p>
                        )}

                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleDeadlineEdit(prazo)}
                            className="bg-black text-white px-3 py-1 rounded-lg"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeadlineDelete(prazo._id)}
                            className="bg-black text-white px-3 py-1 rounded-lg"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
        );
        case "financeiro":
          return (
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-black flex items-center gap-2">
                  <Image src="/icons/icons8-cifrão-100 (1).png" alt="Financeiro" width={25} height={25} />
                  Financeiro
                </h2>

                <button
                  onClick={() => {
                    setShowFinanceForm(true);
                    setEditingFinance(null);
                    setFinanceFormData({ type: "entrada", description: "", value: 0, date: "" });
                  }}
                  className="bg-black text-white px-4 py-3 rounded-lg cursor-pointer transition"
                >
                  Adicionar Registro
                </button>
              </div>

              {showFinanceForm && (
                <form
                  onSubmit={handleFinanceSubmit}
                  className="bg-white shadow-md rounded-lg p-6 mb-6 flex flex-col gap-3"
                >
                  <h3 className="text-lg font-semibold text-black mb-2">
                    {editingFinance ? "Editar Registro" : "Novo Registro"}
                  </h3>

                  <select
                    value={financeFormData.type}
                    onChange={(e) => setFinanceFormData({ ...financeFormData, type: e.target.value })}
                    className="border p-2 rounded"
                  >
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Descrição"
                    value={financeFormData.description}
                    onChange={(e) => setFinanceFormData({ ...financeFormData, description: e.target.value })}
                    className="border p-2 rounded"
                    required
                  />

                  <input
                    type="number"
                    placeholder="Valor"
                    value={financeFormData.value}
                    onChange={(e) => setFinanceFormData({ ...financeFormData, value: parseFloat(e.target.value) })}
                    className="border p-2 rounded"
                    required
                  />

                  <input
                    type="date"
                    value={financeFormData.date}
                    onChange={(e) => setFinanceFormData({ ...financeFormData, date: e.target.value })}
                    className="border p-2 rounded"
                  />

                  <div className="flex gap-3">
                    <button type="submit" className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer">
                      {editingFinance ? "Salvar Alterações" : "Salvar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowFinanceForm(false);
                        setEditingFinance(null);
                        setFinanceFormData({ type: "entrada", description: "", value: 0, date: "" });
                      }}
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {finances.length === 0 ? (
                  <p className="text-gray-600">Nenhum registro financeiro encontrado.</p>
                ) : (
                  finances.map((item) => (
                    <div
                      key={item._id}
                      className="bg-transparent rounded-2xl shadow-lg p-6 hover:shadow-md transition"
                    >
                      <p className="text-black font-semibold flex items-center gap-2">
                        {item.type === "entrada" ? "💰 Entrada" : "📤 Saída"}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">Descrição: {item.description}</p>
                      <p className="text-gray-500 text-sm mt-1">Valor: R$ {item.value.toFixed(2)}</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Data: {new Date(item.date).toLocaleDateString("pt-BR")}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleFinanceEdit(item)}
                          className="bg-black text-white px-3 py-1 rounded-lg"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleFinanceDelete(item._id!)}
                          className="bg-black text-white px-3 py-1 rounded-lg"
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

        case "documentos":
          return (
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-black flex items-center gap-2">
                  <Image src="/icons/documentsIcon.png" alt="Documentos" width={25} height={25} />
                  Documentos
                </h2>

                <button
                  onClick={() => {
                    setShowDocumentForm(true);
                    setEditingDocument(null);
                    setDocumentFormData(initialDocumentFormData);
                  }}
                  className="bg-black text-white px-4 py-3 rounded-lg cursor-pointer"
                >
                  Adicionar Documento
                </button>
              </div>

              {showDocumentForm && (
                <form
                  onSubmit={handleDocumentSubmit}
                  className="bg-white shadow-md rounded-lg p-6 mb-6 flex flex-col gap-3"
                  encType="multipart/form-data"
                >
                  <h3 className="text-lg font-semibold text-black mb-2">
                    {editingDocument ? "Editar Documento" : "Novo Documento"}
                  </h3>

                  <input
                    type="text"
                    placeholder="Título"
                    value={documentFormData.title}
                    onChange={(e) => setDocumentFormData({ ...documentFormData, title: e.target.value })}
                    className="border p-2 rounded"
                    required
                  />

                  <select
                    value={documentFormData.type}
                    onChange={(e) => setDocumentFormData({ ...documentFormData, type: e.target.value })}
                    className="border p-2 rounded"
                  >
                    <option value="petição">Petição</option>
                    <option value="contrato">Contrato</option>
                    <option value="prova">Prova</option>
                    <option value="procuração">Procuração</option>
                    <option value="documento pessoal">Documento pessoal</option>
                    <option value="outros">Outros</option>
                  </select>

                  <textarea
                    placeholder="Descrição"
                    value={documentFormData.description}
                    onChange={(e) => setDocumentFormData({ ...documentFormData, description: e.target.value })}
                    className="border p-2 rounded h-24 resize-none"
                  />

                  <input
                    type="text"
                    placeholder="Tags (separadas por vírgula)"
                    value={documentFormData.tags.join(",")}
                    onChange={(e) =>
                      setDocumentFormData({
                        ...documentFormData,
                        tags: e.target.value.split(",").map(t => t.trim())
                      })
                    }
                    className="border p-2 rounded"
                  />


                  <select
                    value={documentFormData.clientId}
                    onChange={(e) => setDocumentFormData({ ...documentFormData, clientId: e.target.value })}
                    className="border p-2 rounded"
                  >
                    <option value="">Vincular Cliente (opcional)</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>


                  <select
                    value={documentFormData.processId}
                    onChange={(e) => setDocumentFormData({ ...documentFormData, processId: e.target.value })}
                    className="border p-2 rounded"
                  >
                    <option value="">Vincular Processo (opcional)</option>
                    {cases.map((p) => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>


                  <input
                    type="file"
                    onChange={(e) => setDocumentFormData({ ...documentFormData, file: e.target.files?.[0] || null })}
                    className="border p-2 rounded"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    required={!editingDocument}
                  />

                  <div className="flex gap-3">
                    <button type="submit" className="bg-black text-white px-4 py-2 rounded-lg">
                      {editingDocument ? "Salvar alterações" : "Salvar"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowDocumentForm(false)}
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.length === 0 ? (
                  <p className="text-gray-600">Nenhum documento encontrado.</p>
                ) : (
                  documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="bg-transparent rounded-2xl shadow-lg p-6 hover:shadow-md transition"
                    >
                      <p className="text-black font-semibold flex items-center gap-2">
                        <Image src="/icons/documentsIcon.png" alt="" width={20} height={20} />
                        {doc.title}
                      </p>

                      <p className="text-gray-500 text-sm mt-1">Tipo: {doc.type}</p>

                      {doc.clientId && (
                        <p className="text-gray-500 text-sm">Cliente: {doc.clientId?.name}</p>
                      )}

                      {doc.processId && (
                        <p className="text-gray-500 text-sm">Processo: {doc.processId?.title}</p>
                      )}

                      <div className="flex gap-2 mt-3">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          className="bg-black text-white px-3 py-1 rounded-lg"
                        >
                          Baixar
                        </a>

                        <button
                          onClick={() => handleDocumentEdit(doc)}
                          className="bg-black text-white px-3 py-1 rounded-lg"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => handleDocumentDelete(doc._id)}
                          className="bg-black text-white px-3 py-1 rounded-lg"
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


      default:
        return (
          <section>
            <h1 className="text-2xl font-semibold mb-2 text-black">
              Bem-vindo de volta!
            </h1>
            <p className="text-gray-600 mb-8">
              Aqui você acompanha tudo o que importa no seu escritório.
            </p>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-transparent rounded-2xl shadow-2xl p-6 hover:shadow-md transition">
                <p className="text-black font-semibold flex items-center gap-2">
                  <Image src="/icons/calendarIcon.png" alt="Calendar Icon" width={25} height={25} />
                  Prazos cadastrados
                </p>
                <p className="text-gray-500 text-sm mt-1">{stats.totalDeadlines} no total</p>
              </div>

              <div className="bg-transparent rounded-2xl shadow-2xl p-6 hover:shadow-md transition">
                <p className="text-black font-semibold flex items-center gap-2">
                  <Image src="/icons/activeProcess.png" alt="Active Process" width={25} height={25} />
                  Processos ativos
                </p>
                <p className="text-gray-500 text-sm mt-1">{stats.totalCases} em andamento</p>
              </div>

              <div className="bg-transparent rounded-2xl shadow-2xl p-6 hover:shadow-md transition">
                <p className="text-black font-semibold flex items-center gap-2">
                  <Image src="/icons/clientsIcon.png" alt="Clients Icon" width={25} height={25} />
                  Clientes
                </p>
                <p className="text-gray-500 text-sm mt-1">{stats.totalClients} cadastrados</p>
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
        } bg-transparent shadow-2xl transition-all duration-300 flex flex-col items-center py-6 relative m-5 rounded-3xl `}
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

        <div className="mt-auto w-full px-4 pb-6">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={`flex items-center w-full h-12 rounded-xl transition-all
              ${menuOpen ? "gap-4 px-4 justify-start" : "justify-center"}
              bg-black text-white cursor-pointer`}
          >
            <Image
              src="/icons/logoutIcon.png"
              alt="Logout"
              width={24}
              height={24}
            />

            {menuOpen && (
              <span className="text-sm font-medium">Sair</span>
            )}
          </button>
        </div>
      </aside>


      <main className="flex-1 p-8 transition-all">{renderContent()}</main>
    </div>
  );
}
