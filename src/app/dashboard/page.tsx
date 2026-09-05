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

type FormErrors = {
  [key: string]: string;
};

const menuItems = [
  { key: "dashboard", label: "Início", icon: "/icons/dashboard.png" },
  { key: "processos", label: "Processos", icon: "/icons/processIcon.png" },
  { key: "clientes", label: "Clientes", icon: "/icons/clientsIcon.png" },
  { key: "prazos", label: "Prazos e Agenda", icon: "/icons/calendarIcon.png" },
  {
    key: "financeiro",
    label: "Financeiro",
    icon: "/icons/icons8-cifrão-100 (1).png",
  },
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

type Settings = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  cnpj: string;
};

interface FinanceFormData {
  type: string;
  description: string;
  value: number;
  date: string;
}

type PopulatedClient = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
};

type PopulatedProcess = {
  _id: string;
  title: string;
  number?: string;
  status?: string;
  court?: string;
};

type Document = {
  _id: string;
  title: string;
  type: string;

  client?: string;

  clientId?: string | PopulatedClient | null;
  processId?: string | PopulatedProcess | null;

  url?: string;
  fileUrl?: string;

  description?: string;
  tags?: string[];
  date?: string;
};

type Finance = {
  _id: string;
  type: "entrada" | "saida";
  description: string;
  value: number;
  date: string;
};

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
    notes: "",
  });
  const [clientErrors, setClientErrors] = useState<FormErrors>({});
  const [deadlineErrors, setDeadlineErrors] = useState<FormErrors>({});
  const [financeErrors, setFinanceErrors] = useState<FormErrors>({});

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

  const [finances, setFinances] = useState<Finance[]>([]);
  const [showFinanceForm, setShowFinanceForm] = useState(false);
  const [editingFinance, setEditingFinance] = useState<Finance | null>(null);
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

  const [documents, setDocuments] = useState<Document[]>([]);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [documentFormData, setDocumentFormData] = useState<DocumentFormData>(
    initialDocumentFormData,
  );

  const [settingsData, setSettingsData] = useState<Settings>({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    cnpj: "",
  });

  useEffect(() => {
    if (selectedPage === "config") {
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => setSettingsData(data));
    }
  }, [selectedPage]);

  async function handleSettingsSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settingsData),
    });

    if (!res.ok) {
      alert("Erro ao salvar");
      return;
    }

    alert("Salvo com sucesso 🔥");
  }

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
        prev.map((d) => (d._id === saved._id ? saved : d)),
      );
    } else {
      setDocuments((prev) => [...prev, saved]);
    }

    setShowDocumentForm(false);
    setEditingDocument(null);
    setDocumentFormData(initialDocumentFormData);
  }

  function handleDocumentEdit(doc: Document) {
    setEditingDocument(doc);

    setDocumentFormData({
      title: doc.title ?? "",
      type: doc.type ?? "",
      client: doc.client ?? "",

      clientId:
        typeof doc.clientId === "string"
          ? doc.clientId
          : (doc.clientId?._id ?? ""),

      processId:
        typeof doc.processId === "string"
          ? doc.processId
          : (doc.processId?._id ?? ""),

      url: doc.fileUrl ?? doc.url ?? "",
      description: doc.description ?? "",
      tags: doc.tags ?? [],
      file: null,
      date: doc.date?.slice(0, 10) ?? "",
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

        if (!res.ok) {
          console.error(
            "Erro ao buscar documentos:",
            res.status,
            await res.text(),
          );

          setDocuments([]);
          return;
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("Resposta inválida de /api/documents:", data);
          setDocuments([]);
          return;
        }

        setDocuments(data);
      } catch (error) {
        console.error("Erro ao buscar documentos:", error);
        setDocuments([]);
      }
    }

    fetchDocuments();
  }, []);

  useEffect(() => {
    async function fetchDeadlines() {
      try {
        const res = await fetch("/api/deadlines");

        if (!res.ok) {
          console.error("Erro ao buscar prazos:", res.status, await res.text());

          setDeadlines([]);
          return;
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("Resposta inválida de /api/deadlines:", data);
          setDeadlines([]);
          return;
        }

        setDeadlines(data);
      } catch (error) {
        console.error("Erro ao buscar prazos:", error);
        setDeadlines([]);
      }
    }

    fetchDeadlines();
  }, []);

  async function handleDeadlineSubmit(e: React.FormEvent) {
    e.preventDefault();

    const errors: FormErrors = {};

    if (!deadlineFormData.title?.trim()) {
      errors.title = "O título é obrigatório.";
    }

    if (!deadlineFormData.date) {
      errors.date = "A data é obrigatória.";
    } else {
      const selectedDate = new Date(deadlineFormData.date);
      const now = new Date();

      if (selectedDate < now) {
        errors.date = "A data não pode ser no passado.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setDeadlineErrors(errors);
      return;
    }

    setDeadlineErrors({});

    try {
      const method = editingDeadline ? "PUT" : "POST";
      const url = editingDeadline
        ? `/api/deadlines/${editingDeadline._id}`
        : "/api/deadlines";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deadlineFormData),
      });

      if (!res.ok) {
        throw new Error("Erro na requisição");
      }

      const updated = await res.json();

      if (editingDeadline) {
        setDeadlines((prev) =>
          prev.map((p) => (p._id === updated._id ? updated : p)),
        );
        setEditingDeadline(null);
      } else {
        setDeadlines((prev) => [...prev, updated]);
      }

      setShowDeadlineForm(false);
      setDeadlineFormData({
        title: "",
        date: "",
        description: "",
        processId: "",
        status: "pendente",
      });
    } catch (error) {
      console.error("Erro ao salvar prazo:", error);
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
      proc.number.toLowerCase().includes(filterText.toLowerCase()),
  );

  useEffect(() => {
    async function fetchCases() {
      try {
        const res = await fetch("/api/processes");

        if (!res.ok) {
          console.error(
            "Erro ao buscar processos:",
            res.status,
            await res.text(),
          );

          setCases([]);
          return;
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("Resposta inválida de /api/processes:", data);
          setCases([]);
          return;
        }

        setCases(data);
      } catch (error) {
        console.error("Erro ao buscar processos:", error);
        setCases([]);
      }
    }

    fetchCases();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const method = editingCase ? "PUT" : "POST";
    const url = editingCase
      ? `/api/processes/${editingCase._id}`
      : "/api/processes";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const updated = await res.json();

      if (editingCase) {
        setCases((prev) =>
          prev.map((c) => (c._id === updated._id ? updated : c)),
        );
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

    const errors: FormErrors = {};

    if (!clientFormData.name?.trim()) {
      errors.name = "O nome é obrigatório";
    }

    if (!clientFormData.email?.trim()) {
      errors.email = "O e-mail é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(clientFormData.email)) {
      errors.email = "E-mail inválido";
    }

    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
      return;
    }

    setClientErrors({});

    try {
      const method = editingClient ? "PUT" : "POST";
      const url = editingClient
        ? `/api/clients/${editingClient._id}`
        : "/api/clients";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientFormData),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar cliente");
      }

      const updated = await res.json();

      if (editingClient) {
        setClients((prev) =>
          prev.map((c) => (c._id === updated._id ? updated : c)),
        );
        setEditingClient(null);
      } else {
        setClients((prev) => [...prev, updated]);
      }

      setShowClientForm(false);
      setClientFormData({
        name: "",
        email: "",
        phone: "",
        notes: "",
      });
      setClientErrors({});
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar cliente. Tente novamente.");
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

        if (!res.ok) {
          console.error(
            "Erro ao buscar clientes:",
            res.status,
            await res.text(),
          );

          setClients([]);
          return;
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("Resposta inválida de /api/clients:", data);
          setClients([]);
          return;
        }

        setClients(data);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        setClients([]);
      }
    }

    fetchClients();
  }, []);
  useEffect(() => {
    async function fetchFinances() {
      try {
        const res = await fetch("/api/finances");

        if (!res.ok) {
          console.error(
            "Erro ao buscar registros financeiros:",
            res.status,
            await res.text(),
          );

          setFinances([]);
          return;
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("Resposta inválida de /api/finances:", data);
          setFinances([]);
          return;
        }

        setFinances(data);
      } catch (error) {
        console.error("Erro ao buscar registros financeiros:", error);
        setFinances([]);
      }
    }

    fetchFinances();
  }, []);

  async function handleFinanceSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!financeFormData.description?.trim()) {
      alert("A descrição é obrigatória.");
      return;
    }

    if (!financeFormData.value || financeFormData.value <= 0) {
      alert("Informe um valor válido maior que zero.");
      return;
    }

    if (!financeFormData.date) {
      alert("A data é obrigatória.");
      return;
    }

    try {
      const method = editingFinance ? "PUT" : "POST";
      const url = editingFinance
        ? `/api/finances/${editingFinance._id}`
        : "/api/finances";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(financeFormData),
      });

      if (!res.ok) {
        throw new Error("Erro na requisição");
      }

      const updated = await res.json();

      if (editingFinance) {
        setFinances((prev) =>
          prev.map((f) => (f._id === updated._id ? updated : f)),
        );
        setEditingFinance(null);
      } else {
        setFinances((prev) => [...prev, updated]);
      }

      setShowFinanceForm(false);
      setFinanceFormData({
        type: "entrada",
        description: "",
        value: 0,
        date: "",
      });
    } catch (error) {
      console.error("Erro ao salvar registro financeiro:", error);
      alert("Erro ao salvar registro financeiro.");
    }
  }

  function handleFinanceEdit(item: Finance) {
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

  const firstName = session?.user?.name?.split(" ")[0];

  const renderContent = () => {
    switch (selectedPage) {
      case "processos":
        return (
          <section className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-[#8A8B91] mb-2">
                  Gestão de processos
                </p>

                <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-[#111116]">
                  Processos
                </h2>

                <p className="mt-2 text-sm sm:text-base text-[#74757B] max-w-2xl">
                  Acompanhe e gerencie todos os processos ativos do seu
                  escritório.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* FILTRO */}
                <button
                  type="button"
                  onClick={() => setShowFilter((prev) => !prev)}
                  className={`
              flex h-11 items-center justify-center gap-2 rounded-lg
              border px-4 text-sm font-medium transition
              ${
                showFilter
                  ? "border-[#CFCFD4] bg-[#ECECEF] text-[#111116]"
                  : "border-[#DEDEE2] bg-white text-[#66676D] hover:bg-[#F1F1F3]"
              }
            `}
                >
                  <Image
                    src="/icons/filter.png"
                    alt="Filtrar"
                    width={18}
                    height={18}
                    className="opacity-75"
                  />

                  <span className="hidden sm:inline">Filtrar</span>
                </button>

                {/* NOVO PROCESSO */}
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(true);
                    setEditingCase(null);
                    setFormData({
                      title: "",
                      number: "",
                      status: "",
                      court: "",
                      clientId: "",
                    });
                  }}
                  className="flex h-11 items-center justify-center rounded-lg bg-[#111116] px-5 text-sm font-medium text-white transition-colors hover:bg-[#25252B]"
                >
                  + Novo processo
                </button>
              </div>
            </div>

            {/* FILTRO */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                showFilter
                  ? "max-h-24 opacity-100 translate-y-0"
                  : "max-h-0 opacity-0 -translate-y-1"
              }`}
            >
              <div className="rounded-xl border border-[#E1E1E5] bg-white p-3">
                <input
                  type="text"
                  placeholder="Buscar por título ou número..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-4 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8] focus:border-[#BEBEC4] focus:bg-white"
                />
              </div>
            </div>

            {/* FORMULÁRIO */}
            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-7"
              >
                <div className="mb-7 flex items-start justify-between">
                  <div>
                    <p className="text-xs text-[#8A8B91] mb-1">
                      {editingCase ? "Editar cadastro" : "Novo cadastro"}
                    </p>

                    <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#111116]">
                      {editingCase ? "Editar processo" : "Novo processo"}
                    </h3>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* TÍTULO / NÚMERO */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                        Título do processo
                      </label>

                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            title: e.target.value,
                          })
                        }
                        placeholder="Ex: Ação trabalhista"
                        className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8] focus:border-[#BEBEC4] focus:bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                        Número do processo
                      </label>

                      <input
                        type="text"
                        value={formData.number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            number: e.target.value,
                          })
                        }
                        placeholder="0000000-00.0000.0.00.0000"
                        className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8] focus:border-[#BEBEC4] focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  {/* CLIENTE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                      Cliente
                    </label>

                    <select
                      value={
                        typeof formData.clientId === "object"
                          ? formData.clientId._id
                          : formData.clientId
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          clientId: e.target.value,
                        })
                      }
                      className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition focus:border-[#BEBEC4] focus:bg-white"
                      required
                    >
                      <option value="">Selecione o cliente</option>

                      {clients.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* STATUS / TRIBUNAL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                        Status
                      </label>

                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value,
                          })
                        }
                        className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition focus:border-[#BEBEC4] focus:bg-white"
                        required
                      >
                        <option value="">Selecione</option>
                        <option value="ativo">Ativo</option>
                        <option value="suspenso">Suspenso</option>
                        <option value="arquivado">Arquivado</option>
                        <option value="finalizado">Finalizado</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                        Tribunal
                      </label>

                      <input
                        type="text"
                        value={formData.court}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            court: e.target.value,
                          })
                        }
                        placeholder="Ex: TJSP"
                        className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8] focus:border-[#BEBEC4] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* BOTÕES */}
                <div className="mt-7 flex flex-col-reverse gap-2 border-t border-[#ECECEF] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingCase(null);
                      setFormData({
                        title: "",
                        number: "",
                        status: "",
                        court: "",
                        clientId: "",
                      });
                    }}
                    className="h-10 rounded-lg border border-[#DEDEE2] bg-white px-5 text-sm font-medium text-[#64656B] transition hover:bg-[#F3F3F5]"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="h-10 rounded-lg bg-[#111116] px-6 text-sm font-medium text-white transition hover:bg-[#25252B]"
                  >
                    {editingCase ? "Salvar alterações" : "Salvar processo"}
                  </button>
                </div>
              </form>
            )}

            {/* CONTADOR */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#85868C]">
                {filteredCases.length}{" "}
                {filteredCases.length === 1
                  ? "processo encontrado"
                  : "processos encontrados"}
              </p>
            </div>

            {/* PROCESSOS */}
            {filteredCases.length === 0 ? (
              <div className="flex min-h-65 flex-col items-center justify-center rounded-2xl border border-dashed border-[#DADADF] bg-white/50 px-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEEEF1]">
                  <Image
                    src="/icons/processIcon.png"
                    alt="Processos"
                    width={22}
                    height={22}
                    className="opacity-70"
                  />
                </div>

                <h3 className="text-sm font-medium text-[#111116]">
                  Nenhum processo encontrado
                </h3>

                <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#8A8B91]">
                  Cadastre um novo processo ou altere os filtros para visualizar
                  seus registros.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredCases.map((proc) => {
                  const statusLabel =
                    proc.status === "ativo"
                      ? "Ativo"
                      : proc.status === "suspenso"
                        ? "Suspenso"
                        : proc.status === "arquivado"
                          ? "Arquivado"
                          : proc.status === "finalizado"
                            ? "Finalizado"
                            : proc.status;

                  return (
                    <article
                      key={proc._id}
                      className="group rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-6 transition hover:border-[#D1D1D6]"
                    >
                      {/* CARD HEADER */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F1F3]">
                            <Image
                              src="/icons/iconFilesCases.png"
                              alt="Processo"
                              width={18}
                              height={18}
                              className="opacity-75"
                            />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold tracking-[-0.02em] text-[#111116]">
                              {proc.title}
                            </h3>

                            <p className="mt-1 truncate text-xs text-[#8A8B91]">
                              {proc.number}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full border border-[#DEDEE2] bg-[#FAFAFB] px-3 py-1 text-[11px] font-medium text-[#66676D]">
                          {statusLabel}
                        </span>
                      </div>

                      {/* INFO */}
                      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.08em] text-[#A0A1A6]">
                            Cliente
                          </p>

                          <p className="mt-1 text-sm font-medium text-[#34343A]">
                            {typeof proc.clientId === "string"
                              ? "Carregando..."
                              : proc.clientId?.name || "Não informado"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] uppercase tracking-[0.08em] text-[#A0A1A6]">
                            Tribunal
                          </p>

                          <p className="mt-1 text-sm font-medium text-[#34343A]">
                            {proc.court || "Não informado"}
                          </p>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="mt-6 flex items-center gap-2 border-t border-[#ECECEF] pt-4">
                        <button
                          type="button"
                          onClick={() => handleEdit(proc)}
                          className="h-9 rounded-lg border border-[#DEDEE2] bg-white px-4 text-xs font-medium text-[#4F5056] transition hover:bg-[#F1F1F3] hover:text-[#111116]"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(proc._id!)}
                          className="h-9 rounded-lg px-4 text-xs font-medium text-[#7A7B81] transition hover:bg-[#F1F1F3] hover:text-[#111116]"
                        >
                          Excluir
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        );
      case "clientes":
        return (
          <section className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-[#8A8B91] mb-2">
                  Gestão de clientes
                </p>

                <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-[#111116]">
                  Clientes
                </h2>

                <p className="mt-2 text-sm sm:text-base text-[#74757B] max-w-2xl">
                  Centralize os dados dos seus clientes e mantenha seus contatos
                  sempre organizados.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowClientForm(true);
                  setEditingClient(null);
                  setClientFormData({
                    name: "",
                    email: "",
                    phone: "",
                    notes: "",
                  });
                }}
                className="flex h-11 items-center justify-center rounded-lg bg-[#111116] px-5 text-sm font-medium text-white transition-colors hover:bg-[#25252B]"
              >
                + Novo cliente
              </button>
            </div>

            {/* FORMULÁRIO */}
            {showClientForm && (
              <form
                onSubmit={handleClientSubmit}
                className="rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-7"
              >
                <div className="mb-7">
                  <p className="text-xs text-[#8A8B91] mb-1">
                    {editingClient ? "Editar cadastro" : "Novo cadastro"}
                  </p>

                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#111116]">
                    {editingClient ? "Editar cliente" : "Novo cliente"}
                  </h3>
                </div>

                <div className="space-y-5">
                  {/* NOME / EMAIL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                        Nome
                      </label>

                      <input
                        type="text"
                        value={clientFormData.name}
                        onChange={(e) =>
                          setClientFormData({
                            ...clientFormData,
                            name: e.target.value,
                          })
                        }
                        placeholder="Nome completo"
                        className={`h-11 w-full rounded-lg border bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8]
                    ${
                      clientErrors.name
                        ? "border-red-400 focus:border-red-500"
                        : "border-[#DEDEE2] focus:border-[#BEBEC4] focus:bg-white"
                    }
                  `}
                      />

                      {clientErrors.name && (
                        <p className="mt-1.5 text-xs text-red-500">
                          {clientErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                        E-mail
                      </label>

                      <input
                        type="email"
                        value={clientFormData.email}
                        onChange={(e) =>
                          setClientFormData({
                            ...clientFormData,
                            email: e.target.value,
                          })
                        }
                        placeholder="cliente@email.com"
                        className={`h-11 w-full rounded-lg border bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8]
                    ${
                      clientErrors.email
                        ? "border-red-400 focus:border-red-500"
                        : "border-[#DEDEE2] focus:border-[#BEBEC4] focus:bg-white"
                    }
                  `}
                      />

                      {clientErrors.email && (
                        <p className="mt-1.5 text-xs text-red-500">
                          {clientErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* TELEFONE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                      Telefone
                    </label>

                    <input
                      type="text"
                      value={clientFormData.phone}
                      onChange={(e) =>
                        setClientFormData({
                          ...clientFormData,
                          phone: e.target.value,
                        })
                      }
                      placeholder="(11) 99999-9999"
                      className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8] focus:border-[#BEBEC4] focus:bg-white"
                    />
                  </div>

                  {/* OBSERVAÇÕES */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                      Observações
                    </label>

                    <textarea
                      value={clientFormData.notes || ""}
                      onChange={(e) =>
                        setClientFormData({
                          ...clientFormData,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Adicione informações importantes sobre este cliente..."
                      className="min-h-28 w-full resize-none rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 py-3 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8] focus:border-[#BEBEC4] focus:bg-white"
                    />
                  </div>
                </div>

                {/* BOTÕES */}
                <div className="mt-7 flex flex-col-reverse gap-2 border-t border-[#ECECEF] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowClientForm(false);
                      setEditingClient(null);
                      setClientFormData({
                        name: "",
                        email: "",
                        phone: "",
                        notes: "",
                      });
                      setClientErrors({});
                    }}
                    className="h-10 rounded-lg border border-[#DEDEE2] bg-white px-5 text-sm font-medium text-[#64656B] transition hover:bg-[#F3F3F5]"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="h-10 rounded-lg bg-[#111116] px-6 text-sm font-medium text-white transition hover:bg-[#25252B]"
                  >
                    {editingClient ? "Salvar alterações" : "Salvar cliente"}
                  </button>
                </div>
              </form>
            )}

            {/* CONTADOR */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#85868C]">
                {clients.length}{" "}
                {clients.length === 1
                  ? "cliente cadastrado"
                  : "clientes cadastrados"}
              </p>
            </div>

            {/* LISTA */}
            {clients.length === 0 ? (
              <div className="flex min-h-65 flex-col items-center justify-center rounded-2xl border border-dashed border-[#DADADF] bg-white/50 px-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEEEF1]">
                  <Image
                    src="/icons/clientsIcon.png"
                    alt="Clientes"
                    width={22}
                    height={22}
                    className="opacity-70"
                  />
                </div>

                <h3 className="text-sm font-medium text-[#111116]">
                  Nenhum cliente cadastrado
                </h3>

                <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#8A8B91]">
                  Adicione seu primeiro cliente para começar a organizar seus
                  atendimentos e processos.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {clients.map((client) => (
                  <article
                    key={client._id}
                    className="rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-6 transition hover:border-[#D1D1D6]"
                  >
                    {/* HEADER DO CARD */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F1F3]">
                          <Image
                            src="/icons/clientsIcon.png"
                            alt="Cliente"
                            width={19}
                            height={19}
                            className="opacity-75"
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold tracking-[-0.02em] text-[#111116]">
                            {client.name}
                          </h3>

                          <p className="mt-1 truncate text-xs text-[#8A8B91]">
                            {client.email}
                          </p>
                        </div>
                      </div>

                      {/* CONTATOS */}
                      <div className="flex shrink-0 items-center gap-1">
                        {client.phone && (
                          <Link
                            href={`https://wa.me/${client.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Abrir WhatsApp para ${client.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E3E3E7] bg-white transition hover:bg-[#F2F2F4]"
                          >
                            <Image
                              src="/icons/whatsIconClients.png"
                              alt="WhatsApp"
                              width={18}
                              height={18}
                            />
                          </Link>
                        )}

                        {client.email && (
                          <Link
                            href={`mailto:${client.email}`}
                            aria-label={`Enviar e-mail para ${client.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E3E3E7] bg-white transition hover:bg-[#F2F2F4]"
                          >
                            <Image
                              src="/icons/emailIconClient.png"
                              alt="E-mail"
                              width={18}
                              height={18}
                            />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* INFORMAÇÕES */}
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.08em] text-[#A0A1A6]">
                          E-mail
                        </p>

                        <p className="mt-1 break-all text-sm font-medium text-[#34343A]">
                          {client.email || "Não informado"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] uppercase tracking-[0.08em] text-[#A0A1A6]">
                          Telefone
                        </p>

                        <p className="mt-1 text-sm font-medium text-[#34343A]">
                          {client.phone || "Não informado"}
                        </p>
                      </div>
                    </div>

                    {/* OBSERVAÇÕES */}
                    {client.notes && (
                      <div className="mt-5 rounded-xl bg-[#F7F7F8] p-4">
                        <p className="mb-1 text-[11px] uppercase tracking-[0.08em] text-[#A0A1A6]">
                          Observações
                        </p>

                        <p className="whitespace-pre-line text-sm leading-relaxed text-[#66676D]">
                          {client.notes}
                        </p>
                      </div>
                    )}

                    {/* AÇÕES */}
                    <div className="mt-6 flex items-center gap-2 border-t border-[#ECECEF] pt-4">
                      <button
                        type="button"
                        onClick={() => handleClientEdit(client)}
                        className="h-9 rounded-lg border border-[#DEDEE2] bg-white px-4 text-xs font-medium text-[#4F5056] transition hover:bg-[#F1F1F3] hover:text-[#111116]"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleClientDelete(client._id!)}
                        className="h-9 rounded-lg px-4 text-xs font-medium text-[#7A7B81] transition hover:bg-[#F1F1F3] hover:text-[#111116]"
                      >
                        Excluir
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        );
      case "prazos":
        return (
          <section className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-[#8A8B91] mb-2">Prazos e agenda</p>

                <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-[#111116]">
                  Prazos
                </h2>

                <p className="mt-2 text-sm sm:text-base text-[#74757B] max-w-2xl">
                  Organize compromissos, acompanhe vencimentos e mantenha sua
                  agenda jurídica sob controle.
                </p>
              </div>

              <button
                type="button"
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
                className="flex h-11 items-center justify-center rounded-lg bg-[#111116] px-5 text-sm font-medium text-white transition-colors hover:bg-[#25252B]"
              >
                + Novo prazo
              </button>
            </div>

            {/* CALENDÁRIO */}
            <div className="rounded-2xl border border-[#E1E1E5] bg-white p-4 sm:p-6 overflow-hidden">
              <div className="mb-5">
                <p className="text-sm font-medium text-[#111116]">Calendário</p>

                <p className="mt-1 text-xs text-[#8A8B91]">
                  Clique em um prazo para visualizar ou editar.
                </p>
              </div>

              <div className="calendar-lawhub">
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
                    const prazo = deadlines.find(
                      (d) => d._id === info.event.id,
                    );

                    if (prazo) {
                      handleDeadlineEdit(prazo);
                    }
                  }}
                  height="auto"
                />
              </div>
            </div>

            {/* FORMULÁRIO */}
            {showDeadlineForm && (
              <form
                onSubmit={handleDeadlineSubmit}
                className="rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-7"
              >
                <div className="mb-7">
                  <p className="text-xs text-[#8A8B91] mb-1">
                    {editingDeadline ? "Editar cadastro" : "Novo cadastro"}
                  </p>

                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#111116]">
                    {editingDeadline ? "Editar prazo" : "Novo prazo"}
                  </h3>
                </div>

                <div className="space-y-5">
                  {/* TÍTULO / DATA */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                        Título
                      </label>

                      <input
                        type="text"
                        placeholder="Ex: Audiência trabalhista"
                        value={deadlineFormData.title}
                        onChange={(e) =>
                          setDeadlineFormData({
                            ...deadlineFormData,
                            title: e.target.value,
                          })
                        }
                        className={`h-11 w-full rounded-lg border bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8]
                    ${
                      deadlineErrors.title
                        ? "border-red-400 focus:border-red-500"
                        : "border-[#DEDEE2] focus:border-[#BEBEC4] focus:bg-white"
                    }
                  `}
                      />

                      {deadlineErrors.title && (
                        <p className="mt-1.5 text-xs text-red-500">
                          {deadlineErrors.title}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                        Data e horário
                      </label>

                      <input
                        type="datetime-local"
                        value={deadlineFormData.date}
                        onChange={(e) =>
                          setDeadlineFormData({
                            ...deadlineFormData,
                            date: e.target.value,
                          })
                        }
                        className={`h-11 w-full rounded-lg border bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition
                    ${
                      deadlineErrors.date
                        ? "border-red-400 focus:border-red-500"
                        : "border-[#DEDEE2] focus:border-[#BEBEC4] focus:bg-white"
                    }
                  `}
                      />

                      {deadlineErrors.date && (
                        <p className="mt-1.5 text-xs text-red-500">
                          {deadlineErrors.date}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* PROCESSO / STATUS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                        Processo vinculado
                      </label>

                      <select
                        value={deadlineFormData.processId}
                        onChange={(e) =>
                          setDeadlineFormData({
                            ...deadlineFormData,
                            processId: e.target.value,
                          })
                        }
                        className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition focus:border-[#BEBEC4] focus:bg-white"
                      >
                        <option value="">Nenhum processo vinculado</option>

                        {cases.map((proc) => (
                          <option key={proc._id} value={proc._id}>
                            {proc.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                        Status
                      </label>

                      <select
                        value={deadlineFormData.status}
                        onChange={(e) =>
                          setDeadlineFormData({
                            ...deadlineFormData,
                            status: e.target.value,
                          })
                        }
                        className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition focus:border-[#BEBEC4] focus:bg-white"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="concluído">Concluído</option>
                      </select>
                    </div>
                  </div>

                  {/* DESCRIÇÃO */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                      Descrição
                    </label>

                    <textarea
                      placeholder="Adicione detalhes importantes sobre este prazo..."
                      value={deadlineFormData.description}
                      onChange={(e) =>
                        setDeadlineFormData({
                          ...deadlineFormData,
                          description: e.target.value,
                        })
                      }
                      className="min-h-28 w-full resize-none rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 py-3 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8] focus:border-[#BEBEC4] focus:bg-white"
                    />
                  </div>
                </div>

                {/* BOTÕES */}
                <div className="mt-7 flex flex-col-reverse gap-2 border-t border-[#ECECEF] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeadlineForm(false);
                      setEditingDeadline(null);
                      setDeadlineFormData({
                        title: "",
                        date: "",
                        description: "",
                        processId: "",
                        status: "pendente",
                      });
                      setDeadlineErrors({});
                    }}
                    className="h-10 rounded-lg border border-[#DEDEE2] bg-white px-5 text-sm font-medium text-[#64656B] transition hover:bg-[#F3F3F5]"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="h-10 rounded-lg bg-[#111116] px-6 text-sm font-medium text-white transition hover:bg-[#25252B]"
                  >
                    {editingDeadline ? "Salvar alterações" : "Salvar prazo"}
                  </button>
                </div>
              </form>
            )}

            {/* CONTADOR */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#85868C]">
                {deadlines.length}{" "}
                {deadlines.length === 1
                  ? "prazo cadastrado"
                  : "prazos cadastrados"}
              </p>
            </div>

            {/* LISTA DE PRAZOS */}
            {deadlines.length === 0 ? (
              <div className="flex min-h-65 flex-col items-center justify-center rounded-2xl border border-dashed border-[#DADADF] bg-white/50 px-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEEEF1]">
                  <Image
                    src="/icons/calendarIcon.png"
                    alt="Prazos"
                    width={22}
                    height={22}
                    className="opacity-70"
                  />
                </div>

                <h3 className="text-sm font-medium text-[#111116]">
                  Nenhum prazo cadastrado
                </h3>

                <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#8A8B91]">
                  Adicione um prazo para acompanhar seus compromissos e
                  vencimentos.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {deadlines.map((prazo) => {
                  const urgency = getUrgencyLevel(prazo.date);

                  const urgencyLabel =
                    urgency === "late"
                      ? "Atrasado"
                      : urgency === "urgent"
                        ? "Urgente"
                        : urgency === "warning"
                          ? "Atenção"
                          : "No prazo";

                  return (
                    <article
                      key={prazo._id}
                      className="rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-6 transition hover:border-[#D1D1D6]"
                    >
                      {/* HEADER */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F1F3]">
                            <Image
                              src="/icons/calendarIcon.png"
                              alt="Prazo"
                              width={19}
                              height={19}
                              className="opacity-75"
                            />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold tracking-[-0.02em] text-[#111116]">
                              {prazo.title}
                            </h3>

                            <p className="mt-1 text-xs text-[#8A8B91]">
                              {new Date(prazo.date).toLocaleString("pt-BR")}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`
                      shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium
                      ${
                        urgency === "late"
                          ? "border-red-200 bg-red-50 text-red-600"
                          : urgency === "urgent"
                            ? "border-orange-200 bg-orange-50 text-orange-600"
                            : urgency === "warning"
                              ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                              : "border-[#DEDEE2] bg-[#FAFAFB] text-[#66676D]"
                      }
                    `}
                        >
                          {urgencyLabel}
                        </span>
                      </div>

                      {/* INFORMAÇÕES */}
                      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.08em] text-[#A0A1A6]">
                            Status
                          </p>

                          <p className="mt-1 text-sm font-medium text-[#34343A] capitalize">
                            {prazo.status}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] uppercase tracking-[0.08em] text-[#A0A1A6]">
                            Data
                          </p>

                          <p className="mt-1 text-sm font-medium text-[#34343A]">
                            {new Date(prazo.date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>

                      {/* DESCRIÇÃO */}
                      {prazo.description && (
                        <div className="mt-5 rounded-xl bg-[#F7F7F8] p-4">
                          <p className="mb-1 text-[11px] uppercase tracking-[0.08em] text-[#A0A1A6]">
                            Descrição
                          </p>

                          <p className="whitespace-pre-line text-sm leading-relaxed text-[#66676D]">
                            {prazo.description}
                          </p>
                        </div>
                      )}

                      {/* AÇÕES */}
                      <div className="mt-6 flex items-center gap-2 border-t border-[#ECECEF] pt-4">
                        <button
                          type="button"
                          onClick={() => handleDeadlineEdit(prazo)}
                          className="h-9 rounded-lg border border-[#DEDEE2] bg-white px-4 text-xs font-medium text-[#4F5056] transition hover:bg-[#F1F1F3] hover:text-[#111116]"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeadlineDelete(prazo._id)}
                          className="h-9 rounded-lg px-4 text-xs font-medium text-[#7A7B81] transition hover:bg-[#F1F1F3] hover:text-[#111116]"
                        >
                          Excluir
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        );
      case "financeiro": {
        const totalEntradas = finances
          .filter((item) => item.type === "entrada")
          .reduce((acc, item) => acc + item.value, 0);

        const totalSaidas = finances
          .filter((item) => item.type === "saida")
          .reduce((acc, item) => acc + item.value, 0);

        const saldo = totalEntradas - totalSaidas;

        return (
          <section className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-[#8A8B91] mb-2">Gestão financeira</p>

                <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-[#111116]">
                  Financeiro
                </h2>

                <p className="mt-2 max-w-2xl text-sm sm:text-base text-[#74757B]">
                  Acompanhe entradas, saídas e mantenha uma visão clara das
                  finanças do escritório.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowFinanceForm(true);
                  setEditingFinance(null);
                  setFinanceFormData({
                    type: "entrada",
                    description: "",
                    value: 0,
                    date: "",
                  });
                }}
                className="flex h-11 items-center justify-center rounded-lg bg-[#111116] px-5 text-sm font-medium text-white transition-colors hover:bg-[#25252B]"
              >
                + Novo registro
              </button>
            </div>

            {/* RESUMO */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {/* ENTRADAS */}
              <div className="rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[#77787E]">Entradas</p>

                    <p className="mt-3 text-2xl sm:text-3xl font-semibold tracking-[-0.04em] text-[#111116]">
                      {totalEntradas.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>

                    <p className="mt-1 text-xs text-[#A0A1A6]">
                      valores recebidos
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2F2F4] text-lg">
                    ↑
                  </div>
                </div>
              </div>

              {/* SAÍDAS */}
              <div className="rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[#77787E]">Saídas</p>

                    <p className="mt-3 text-2xl sm:text-3xl font-semibold tracking-[-0.04em] text-[#111116]">
                      {totalSaidas.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>

                    <p className="mt-1 text-xs text-[#A0A1A6]">valores pagos</p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2F2F4] text-lg">
                    ↓
                  </div>
                </div>
              </div>

              {/* SALDO */}
              <div className="rounded-2xl bg-[#111116] p-5 text-white sm:col-span-2 sm:p-6 xl:col-span-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[#A9A9AF]">Saldo atual</p>

                    <p className="mt-3 text-2xl sm:text-3xl font-semibold tracking-[-0.04em]">
                      {saldo.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>

                    <p className="mt-1 text-xs text-[#8D8E94]">
                      entradas menos saídas
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#24242A]">
                    <Image
                      src="/icons/icons8-cifrão-100 (1).png"
                      alt="Financeiro"
                      width={20}
                      height={20}
                      className="brightness-0 invert opacity-90"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* FORMULÁRIO */}
            {showFinanceForm && (
              <form
                onSubmit={handleFinanceSubmit}
                className="rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-7"
              >
                <div className="mb-7">
                  <p className="mb-1 text-xs text-[#8A8B91]">
                    {editingFinance ? "Editar registro" : "Novo registro"}
                  </p>

                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#111116]">
                    {editingFinance
                      ? "Editar movimentação"
                      : "Nova movimentação"}
                  </h3>
                </div>

                <div className="space-y-5">
                  {/* TIPO / DATA */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                        Tipo
                      </label>

                      <select
                        value={financeFormData.type}
                        onChange={(e) =>
                          setFinanceFormData({
                            ...financeFormData,
                            type: e.target.value,
                          })
                        }
                        className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition focus:border-[#BEBEC4] focus:bg-white"
                      >
                        <option value="entrada">Entrada</option>
                        <option value="saida">Saída</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                        Data
                      </label>

                      <input
                        type="date"
                        value={financeFormData.date}
                        onChange={(e) =>
                          setFinanceFormData({
                            ...financeFormData,
                            date: e.target.value,
                          })
                        }
                        className={`h-11 w-full rounded-lg border bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition
                    ${
                      financeErrors.date
                        ? "border-red-400 focus:border-red-500"
                        : "border-[#DEDEE2] focus:border-[#BEBEC4] focus:bg-white"
                    }
                  `}
                      />

                      {financeErrors.date && (
                        <p className="mt-1.5 text-xs text-red-500">
                          {financeErrors.date}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* DESCRIÇÃO */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                      Descrição
                    </label>

                    <input
                      type="text"
                      value={financeFormData.description}
                      onChange={(e) =>
                        setFinanceFormData({
                          ...financeFormData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Ex: Honorários advocatícios"
                      className={`h-11 w-full rounded-lg border bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8]
                  ${
                    financeErrors.description
                      ? "border-red-400 focus:border-red-500"
                      : "border-[#DEDEE2] focus:border-[#BEBEC4] focus:bg-white"
                  }
                `}
                    />

                    {financeErrors.description && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {financeErrors.description}
                      </p>
                    )}
                  </div>

                  {/* VALOR */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                      Valor
                    </label>

                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#8A8B91]">
                        R$
                      </span>

                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={financeFormData.value || ""}
                        onChange={(e) =>
                          setFinanceFormData({
                            ...financeFormData,
                            value: parseFloat(e.target.value),
                          })
                        }
                        placeholder="0,00"
                        className={`h-11 w-full rounded-lg border bg-[#FAFAFB] pl-10 pr-3.5 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8]
                    ${
                      financeErrors.value
                        ? "border-red-400 focus:border-red-500"
                        : "border-[#DEDEE2] focus:border-[#BEBEC4] focus:bg-white"
                    }
                  `}
                      />
                    </div>

                    {financeErrors.value && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {financeErrors.value}
                      </p>
                    )}
                  </div>
                </div>

                {/* BOTÕES */}
                <div className="mt-7 flex flex-col-reverse gap-2 border-t border-[#ECECEF] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFinanceForm(false);
                      setEditingFinance(null);
                      setFinanceFormData({
                        type: "entrada",
                        description: "",
                        value: 0,
                        date: "",
                      });
                      setFinanceErrors({});
                    }}
                    className="h-10 rounded-lg border border-[#DEDEE2] bg-white px-5 text-sm font-medium text-[#64656B] transition hover:bg-[#F3F3F5]"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="h-10 rounded-lg bg-[#111116] px-6 text-sm font-medium text-white transition hover:bg-[#25252B]"
                  >
                    {editingFinance ? "Salvar alterações" : "Salvar registro"}
                  </button>
                </div>
              </form>
            )}

            {/* REGISTROS */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#111116]">
                  Movimentações
                </p>

                <p className="mt-1 text-xs text-[#8A8B91]">
                  {finances.length}{" "}
                  {finances.length === 1
                    ? "registro financeiro"
                    : "registros financeiros"}
                </p>
              </div>
            </div>

            {finances.length === 0 ? (
              <div className="flex min-h-65 flex-col items-center justify-center rounded-2xl border border-dashed border-[#DADADF] bg-white/50 px-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEEEF1]">
                  <Image
                    src="/icons/icons8-cifrão-100 (1).png"
                    alt="Financeiro"
                    width={22}
                    height={22}
                    className="opacity-70"
                  />
                </div>

                <h3 className="text-sm font-medium text-[#111116]">
                  Nenhuma movimentação encontrada
                </h3>

                <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#8A8B91]">
                  Adicione entradas e saídas para acompanhar o financeiro do
                  escritório.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {finances.map((item) => {
                  const isEntrada = item.type === "entrada";

                  return (
                    <article
                      key={item._id}
                      className="rounded-2xl border border-[#E1E1E5] bg-white p-5 transition hover:border-[#D1D1D6] sm:p-6"
                    >
                      {/* HEADER */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F1F3] text-base font-medium text-[#111116]">
                            {isEntrada ? "↑" : "↓"}
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold tracking-[-0.02em] text-[#111116]">
                              {item.description}
                            </h3>

                            <p className="mt-1 text-xs text-[#8A8B91]">
                              {new Date(item.date).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full border border-[#DEDEE2] bg-[#FAFAFB] px-3 py-1 text-[11px] font-medium text-[#66676D]">
                          {isEntrada ? "Entrada" : "Saída"}
                        </span>
                      </div>

                      {/* VALOR */}
                      <div className="mt-6">
                        <p className="text-[11px] uppercase tracking-[0.08em] text-[#A0A1A6]">
                          Valor
                        </p>

                        <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#111116]">
                          {item.value.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                      </div>

                      {/* DETALHES */}
                      <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-[#F7F7F8] p-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.08em] text-[#A0A1A6]">
                            Tipo
                          </p>

                          <p className="mt-1 text-sm font-medium text-[#34343A]">
                            {isEntrada ? "Entrada" : "Saída"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] uppercase tracking-[0.08em] text-[#A0A1A6]">
                            Data
                          </p>

                          <p className="mt-1 text-sm font-medium text-[#34343A]">
                            {new Date(item.date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>

                      {/* AÇÕES */}
                      <div className="mt-6 flex items-center gap-2 border-t border-[#ECECEF] pt-4">
                        <button
                          type="button"
                          onClick={() => handleFinanceEdit(item)}
                          className="h-9 rounded-lg border border-[#DEDEE2] bg-white px-4 text-xs font-medium text-[#4F5056] transition hover:bg-[#F1F1F3] hover:text-[#111116]"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleFinanceDelete(item._id!)}
                          className="h-9 rounded-lg px-4 text-xs font-medium text-[#7A7B81] transition hover:bg-[#F1F1F3] hover:text-[#111116]"
                        >
                          Excluir
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        );
      }
      case "documentos":
        return (
          <section className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-[#8A8B91] mb-2">
                  Gestão de documentos
                </p>

                <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-[#111116]">
                  Documentos
                </h2>

                <p className="mt-2 max-w-2xl text-sm sm:text-base text-[#74757B]">
                  Organize arquivos, vincule documentos a clientes e processos e
                  mantenha tudo centralizado.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowDocumentForm(true);
                  setEditingDocument(null);
                  setDocumentFormData(initialDocumentFormData);
                }}
                className="flex h-11 items-center justify-center rounded-lg bg-[#111116] px-5 text-sm font-medium text-white transition-colors hover:bg-[#25252B]"
              >
                + Novo documento
              </button>
            </div>

            {/* FORMULÁRIO */}
            {showDocumentForm && (
              <form
                onSubmit={handleDocumentSubmit}
                encType="multipart/form-data"
                className="rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-7"
              >
                <div className="mb-7">
                  <p className="mb-1 text-xs text-[#8A8B91]">
                    {editingDocument ? "Editar cadastro" : "Novo cadastro"}
                  </p>

                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#111116]">
                    {editingDocument ? "Editar documento" : "Novo documento"}
                  </h3>
                </div>

                <div className="space-y-5">
                  {/* TÍTULO / TIPO */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                        Título
                      </label>

                      <input
                        type="text"
                        placeholder="Ex: Contrato de prestação de serviços"
                        value={documentFormData.title}
                        onChange={(e) =>
                          setDocumentFormData({
                            ...documentFormData,
                            title: e.target.value,
                          })
                        }
                        className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8] focus:border-[#BEBEC4] focus:bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                        Tipo
                      </label>

                      <select
                        value={documentFormData.type}
                        onChange={(e) =>
                          setDocumentFormData({
                            ...documentFormData,
                            type: e.target.value,
                          })
                        }
                        className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition focus:border-[#BEBEC4] focus:bg-white"
                      >
                        <option value="petição">Petição</option>
                        <option value="contrato">Contrato</option>
                        <option value="prova">Prova</option>
                        <option value="procuração">Procuração</option>
                        <option value="documento pessoal">
                          Documento pessoal
                        </option>
                        <option value="outros">Outros</option>
                      </select>
                    </div>
                  </div>

                  {/* CLIENTE / PROCESSO */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                        Cliente vinculado
                      </label>

                      <select
                        value={documentFormData.clientId}
                        onChange={(e) =>
                          setDocumentFormData({
                            ...documentFormData,
                            clientId: e.target.value,
                          })
                        }
                        className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition focus:border-[#BEBEC4] focus:bg-white"
                      >
                        <option value="">Nenhum cliente vinculado</option>

                        {clients.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                        Processo vinculado
                      </label>

                      <select
                        value={documentFormData.processId}
                        onChange={(e) =>
                          setDocumentFormData({
                            ...documentFormData,
                            processId: e.target.value,
                          })
                        }
                        className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition focus:border-[#BEBEC4] focus:bg-white"
                      >
                        <option value="">Nenhum processo vinculado</option>

                        {cases.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* DESCRIÇÃO */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                      Descrição
                    </label>

                    <textarea
                      placeholder="Adicione informações importantes sobre este documento..."
                      value={documentFormData.description}
                      onChange={(e) =>
                        setDocumentFormData({
                          ...documentFormData,
                          description: e.target.value,
                        })
                      }
                      className="min-h-28 w-full resize-none rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 py-3 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8] focus:border-[#BEBEC4] focus:bg-white"
                    />
                  </div>

                  {/* TAGS */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                      Tags
                    </label>

                    <input
                      type="text"
                      placeholder="contrato, cliente, processo"
                      value={documentFormData.tags.join(", ")}
                      onChange={(e) =>
                        setDocumentFormData({
                          ...documentFormData,
                          tags: e.target.value
                            .split(",")
                            .map((tag) => tag.trim()),
                        })
                      }
                      className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8] focus:border-[#BEBEC4] focus:bg-white"
                    />

                    <p className="mt-1.5 text-xs text-[#9A9BA0]">
                      Separe as tags por vírgula.
                    </p>
                  </div>

                  {/* ARQUIVO */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                      Arquivo
                    </label>

                    <div className="rounded-xl border border-dashed border-[#D8D8DD] bg-[#FAFAFB] p-4">
                      <input
                        type="file"
                        onChange={(e) =>
                          setDocumentFormData({
                            ...documentFormData,
                            file: e.target.files?.[0] || null,
                          })
                        }
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        required={!editingDocument}
                        className="block w-full cursor-pointer text-sm text-[#66676D] file:mr-4 file:rounded-lg file:border-0 file:bg-[#111116] file:px-4 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-[#25252B]"
                      />

                      <p className="mt-2 text-xs text-[#9A9BA0]">
                        PDF, DOC, DOCX, PNG, JPG ou JPEG.
                      </p>
                    </div>
                  </div>
                </div>

                {/* BOTÕES */}
                <div className="mt-7 flex flex-col-reverse gap-2 border-t border-[#ECECEF] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDocumentForm(false);
                      setEditingDocument(null);
                      setDocumentFormData(initialDocumentFormData);
                    }}
                    className="h-10 rounded-lg border border-[#DEDEE2] bg-white px-5 text-sm font-medium text-[#64656B] transition hover:bg-[#F3F3F5]"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="h-10 rounded-lg bg-[#111116] px-6 text-sm font-medium text-white transition hover:bg-[#25252B]"
                  >
                    {editingDocument ? "Salvar alterações" : "Salvar documento"}
                  </button>
                </div>
              </form>
            )}

            {/* CONTADOR */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#111116]">Arquivos</p>

                <p className="mt-1 text-xs text-[#8A8B91]">
                  {documents.length}{" "}
                  {documents.length === 1
                    ? "documento cadastrado"
                    : "documentos cadastrados"}
                </p>
              </div>
            </div>

            {/* LISTA */}
            {documents.length === 0 ? (
              <div className="flex min-h-65 flex-col items-center justify-center rounded-2xl border border-dashed border-[#DADADF] bg-white/50 px-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEEEF1]">
                  <Image
                    src="/icons/documentsIcon.png"
                    alt="Documentos"
                    width={22}
                    height={22}
                    className="opacity-70"
                  />
                </div>

                <h3 className="text-sm font-medium text-[#111116]">
                  Nenhum documento cadastrado
                </h3>

                <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#8A8B91]">
                  Adicione documentos e vincule-os a clientes ou processos do
                  escritório.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {documents.map((doc) => {
                  const documentUrl = doc.fileUrl ?? doc.url;

                  return (
                    <article
                      key={doc._id}
                      className="rounded-2xl border border-[#E1E1E5] bg-white p-5 transition hover:border-[#D1D1D6] sm:p-6"
                    >
                      {/* HEADER */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F1F3]">
                            <Image
                              src="/icons/documentsIcon.png"
                              alt="Documento"
                              width={19}
                              height={19}
                              className="opacity-75"
                            />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold tracking-[-0.02em] text-[#111116]">
                              {doc.title}
                            </h3>

                            <p className="mt-1 text-xs capitalize text-[#8A8B91]">
                              {doc.type}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full border border-[#DEDEE2] bg-[#FAFAFB] px-3 py-1 text-[11px] font-medium capitalize text-[#66676D]">
                          {doc.type}
                        </span>
                      </div>

                      {/* INFORMAÇÕES */}
                      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.08em] text-[#A0A1A6]">
                            Cliente
                          </p>

                          <p className="mt-1 text-sm font-medium text-[#34343A]">
                            {doc.clientId && typeof doc.clientId !== "string"
                              ? doc.clientId.name
                              : "Não vinculado"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] uppercase tracking-[0.08em] text-[#A0A1A6]">
                            Processo
                          </p>

                          <p className="mt-1 text-sm font-medium text-[#34343A]">
                            {doc.processId && typeof doc.processId !== "string"
                              ? doc.processId.title
                              : "Não vinculado"}
                          </p>
                        </div>
                      </div>

                      {/* DESCRIÇÃO */}
                      {doc.description && (
                        <div className="mt-5 rounded-xl bg-[#F7F7F8] p-4">
                          <p className="mb-1 text-[11px] uppercase tracking-[0.08em] text-[#A0A1A6]">
                            Descrição
                          </p>

                          <p className="whitespace-pre-line text-sm leading-relaxed text-[#66676D]">
                            {doc.description}
                          </p>
                        </div>
                      )}

                      {/* TAGS */}
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {doc.tags
                            .filter((tag) => tag.trim() !== "")
                            .map((tag, index) => (
                              <span
                                key={`${tag}-${index}`}
                                className="rounded-full border border-[#E1E1E5] bg-[#FAFAFB] px-2.5 py-1 text-[10px] font-medium text-[#74757B]"
                              >
                                {tag}
                              </span>
                            ))}
                        </div>
                      )}

                      {/* AÇÕES */}
                      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[#ECECEF] pt-4">
                        {documentUrl && (
                          <a
                            href={documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-9 items-center rounded-lg bg-[#111116] px-4 text-xs font-medium text-white transition hover:bg-[#25252B]"
                          >
                            Abrir documento
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDocumentEdit(doc)}
                          className="h-9 rounded-lg border border-[#DEDEE2] bg-white px-4 text-xs font-medium text-[#4F5056] transition hover:bg-[#F1F1F3] hover:text-[#111116]"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDocumentDelete(doc._id)}
                          className="h-9 rounded-lg px-4 text-xs font-medium text-[#7A7B81] transition hover:bg-[#F1F1F3] hover:text-[#111116]"
                        >
                          Excluir
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        );
      case "config":
        return (
          <section className="space-y-6">
            {/* HEADER */}
            <div>
              <p className="text-sm text-[#8A8B91] mb-2">
                Preferências da conta
              </p>

              <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-[#111116]">
                Configurações
              </h2>

              <p className="mt-2 max-w-2xl text-sm sm:text-base text-[#74757B]">
                Gerencie suas informações pessoais e os dados do seu escritório.
              </p>
            </div>

            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              {/* PERFIL */}
              <section className="rounded-2xl border border-[#E1E1E5] bg-white">
                <div className="border-b border-[#ECECEF] p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F1F3]">
                      <span className="text-sm font-semibold text-[#111116]">
                        {settingsData.name?.charAt(0)?.toUpperCase() || "P"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold tracking-[-0.02em] text-[#111116]">
                        Perfil
                      </h3>

                      <p className="mt-1 text-xs leading-relaxed text-[#8A8B91]">
                        Informações utilizadas para identificar sua conta no Law
                        Hub.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* NOME */}
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                        Nome
                      </label>

                      <input
                        type="text"
                        placeholder="Seu nome completo"
                        value={settingsData.name}
                        onChange={(e) =>
                          setSettingsData({
                            ...settingsData,
                            name: e.target.value,
                          })
                        }
                        className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8] focus:border-[#BEBEC4] focus:bg-white"
                      />
                    </div>

                    {/* EMAIL */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                        E-mail
                      </label>

                      <input
                        type="email"
                        placeholder="seu@email.com"
                        value={settingsData.email}
                        onChange={(e) =>
                          setSettingsData({
                            ...settingsData,
                            email: e.target.value,
                          })
                        }
                        className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8] focus:border-[#BEBEC4] focus:bg-white"
                      />
                    </div>

                    {/* TELEFONE */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                        Telefone
                      </label>

                      <input
                        type="text"
                        placeholder="(11) 99999-9999"
                        value={settingsData.phone}
                        onChange={(e) =>
                          setSettingsData({
                            ...settingsData,
                            phone: e.target.value,
                          })
                        }
                        className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8] focus:border-[#BEBEC4] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* ESCRITÓRIO */}
              <section className="rounded-2xl border border-[#E1E1E5] bg-white">
                <div className="border-b border-[#ECECEF] p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F1F3]">
                      <span className="text-base text-[#111116]">↗</span>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold tracking-[-0.02em] text-[#111116]">
                        Escritório
                      </h3>

                      <p className="mt-1 text-xs leading-relaxed text-[#8A8B91]">
                        Dados institucionais vinculados ao seu escritório.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* NOME DO ESCRITÓRIO */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                        Nome do escritório
                      </label>

                      <input
                        type="text"
                        placeholder="Ex: Miller Advocacia"
                        value={settingsData.companyName}
                        onChange={(e) =>
                          setSettingsData({
                            ...settingsData,
                            companyName: e.target.value,
                          })
                        }
                        className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8] focus:border-[#BEBEC4] focus:bg-white"
                      />
                    </div>

                    {/* CNPJ */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#2A2A2F]">
                        CNPJ
                      </label>

                      <input
                        type="text"
                        placeholder="00.000.000/0000-00"
                        value={settingsData.cnpj}
                        onChange={(e) =>
                          setSettingsData({
                            ...settingsData,
                            cnpj: e.target.value,
                          })
                        }
                        className="h-11 w-full rounded-lg border border-[#DEDEE2] bg-[#FAFAFB] px-3.5 text-sm text-[#111116] outline-none transition placeholder:text-[#A2A3A8] focus:border-[#BEBEC4] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* AÇÕES */}
              <div className="flex flex-col gap-3 rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <p className="text-sm font-medium text-[#111116]">
                    Salvar alterações
                  </p>

                  <p className="mt-1 text-xs text-[#8A8B91]">
                    Atualize as informações da sua conta e do escritório.
                  </p>
                </div>

                <button
                  type="submit"
                  className="flex h-11 items-center justify-center rounded-lg bg-[#111116] px-6 text-sm font-medium text-white transition hover:bg-[#25252B]"
                >
                  Salvar configurações
                </button>
              </div>
            </form>
          </section>
        );
      default:
        return (
          <section className="space-y-8">
            {/* HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-[#8A8B91] mb-2">Visão geral</p>

                <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-[#111116]">
                  Bem-vindo de volta{firstName ? `, ${firstName}` : ""}.
                </h1>

                <p className="mt-2 text-sm sm:text-base text-[#74757B]">
                  Acompanhe os principais dados do seu escritório em um só
                  lugar.
                </p>
              </div>
            </div>

            {/* CARDS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* PRAZOS */}
              <div className="rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-6 transition hover:border-[#D2D2D7]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[#77787E]">Prazos cadastrados</p>

                    <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#111116]">
                      {deadlines.length}
                    </p>

                    <p className="mt-1 text-xs text-[#A0A1A6]">no total</p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2F2F4]">
                    <Image
                      src="/icons/calendarIcon.png"
                      alt="Prazos"
                      width={20}
                      height={20}
                      className="opacity-80"
                    />
                  </div>
                </div>
              </div>

              {/* PROCESSOS */}
              <div className="rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-6 transition hover:border-[#D2D2D7]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[#77787E]">Processos ativos</p>

                    <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#111116]">
                      {cases.length}
                    </p>

                    <p className="mt-1 text-xs text-[#A0A1A6]">em andamento</p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2F2F4]">
                    <Image
                      src="/icons/activeProcess.png"
                      alt="Processos"
                      width={20}
                      height={20}
                      className="opacity-80"
                    />
                  </div>
                </div>
              </div>

              {/* CLIENTES */}
              <div className="rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-6 transition hover:border-[#D2D2D7] sm:col-span-2 xl:col-span-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[#77787E]">Clientes</p>

                    <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#111116]">
                      {clients.length}
                    </p>

                    <p className="mt-1 text-xs text-[#A0A1A6]">cadastrados</p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2F2F4]">
                    <Image
                      src="/icons/clientsIcon.png"
                      alt="Clientes"
                      width={20}
                      height={20}
                      className="opacity-80"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ÁREA INFERIOR */}
            <section className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4">
              {/* RESUMO */}
              <div className="rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-6">
                <div className="mb-6">
                  <p className="text-sm font-medium text-[#111116]">
                    Resumo do escritório
                  </p>

                  <p className="mt-1 text-xs text-[#8A8B91]">
                    Uma visão rápida da sua operação.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-[#74757B]">Processos</span>

                      <span className="text-sm font-medium text-[#111116]">
                        {cases.length}
                      </span>
                    </div>

                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EFEFF1]">
                      <div
                        className="h-full rounded-full bg-[#111116]"
                        style={{
                          width: `${Math.min(cases.length * 8, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-[#74757B]">Clientes</span>

                      <span className="text-sm font-medium text-[#111116]">
                        {clients.length}
                      </span>
                    </div>

                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EFEFF1]">
                      <div
                        className="h-full rounded-full bg-[#111116]"
                        style={{
                          width: `${Math.min(clients.length * 5, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-[#74757B]">Prazos</span>

                      <span className="text-sm font-medium text-[#111116]">
                        {deadlines.length}
                      </span>
                    </div>

                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EFEFF1]">
                      <div
                        className="h-full rounded-full bg-[#111116]"
                        style={{
                          width: `${Math.min(deadlines.length * 10, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* STATUS */}
              <div className="rounded-2xl bg-[#111116] p-5 sm:p-6 text-white">
                <p className="text-sm text-[#A9A9AF]">Status do escritório</p>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                  Tudo organizado.
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-[#A9A9AF]">
                  Seus processos, clientes e prazos estão centralizados no Law
                  Hub.
                </p>

                <div className="mt-8 border-t border-[#2A2A30] pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#A9A9AF]">
                      Registros totais
                    </span>

                    <span className="text-xl font-semibold">
                      {cases.length + clients.length + deadlines.length}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </section>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* SIDEBAR */}
      <aside
        className={`
      ${menuOpen ? "w-56" : "w-20"} 
      hidden md:flex
      bg-transparent shadow-2xl transition-all duration-300 
      flex-col items-center py-6 relative m-5 rounded-3xl
    `}
      >
        {/* BOTÃO MENU */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="absolute top-6 left-6 flex flex-col justify-between w-7 h-5 cursor-pointer z-50"
        >
          <span
            className={`h-0.75 w-full bg-black rounded transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2.25" : ""}`}
          />
          <span
            className={`h-0.75 w-full bg-black rounded transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`h-0.75 w-full bg-black rounded transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>

        {/* MENU */}
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
                  menuOpen
                    ? "gap-4 w-full justify-start"
                    : "justify-center w-12"
                } h-12 rounded-xl hover:bg-gray-200 transition-all ${
                  selectedPage === item.key ? "bg-gray-200" : ""
                }`}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={27}
                  height={27}
                />
                {menuOpen && (
                  <span className="text-black text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </div>

              {!menuOpen && (
                <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-black text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 whitespace-nowrap shadow-lg">
                  {item.label}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* LOGOUT */}
        <div className="mt-auto w-full px-4 pb-6">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={`flex items-center w-full h-12 rounded-xl transition-all
          ${menuOpen ? "gap-4 px-4 justify-start" : "justify-center"}
          bg-black text-white`}
          >
            <Image
              src="/icons/logoutIcon.png"
              alt="Logout"
              width={24}
              height={24}
            />
            {menuOpen && <span className="text-sm font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE NAV (BOTTOM) */}
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg flex justify-around items-center py-2 md:hidden z-50">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() =>
              setSelectedPage(item.key === "dashboard" ? "" : item.key)
            }
            className="flex flex-col items-center text-xs"
          >
            <Image src={item.icon} alt={item.label} width={22} height={22} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 transition-all">
        {renderContent()}
      </main>
    </div>
  );
}
