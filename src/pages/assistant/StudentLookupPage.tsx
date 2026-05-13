import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, StatusBadge, Table, Button } from "../../components/ui";
import { api } from "../../services/api";
import type { Column } from "../../components/ui";
import type {
  Student,
  Loan,
  Sanction,
  LoanStatus,
  SanctionStatus,
} from "../../types";

// ── Fetchers ───────────────────────────────────────
const searchStudent = async (query: string): Promise<Student[]> => {
  const { data } = await api.get<Student[]>(`/students/search?q=${query}`);
  return data;
};

const fetchStudentLoans = async (id: number): Promise<Loan[]> => {
  const { data } = await api.get<Loan[]>(`/loans/student/${id}`);
  return data;
};

const fetchStudentSanctions = async (id: number): Promise<Sanction[]> => {
  const { data } = await api.get<Sanction[]>(`/sanctions/student/${id}`);
  return data;
};

// ── Status configs ─────────────────────────────────
const loanStatusConfig: Record<
  LoanStatus,
  { label: string; variant: "success" | "danger" | "neutral" }
> = {
  active: { label: "Activo", variant: "success" },
  closed: { label: "Cerrado", variant: "neutral" },
  overdue: { label: "Vencido", variant: "danger" },
};

const sanctionStatusConfig: Record<
  SanctionStatus,
  { label: string; variant: "danger" | "neutral" }
> = {
  active: { label: "Activa", variant: "danger" },
  closed: { label: "Cerrada", variant: "neutral" },
};

// ── Columns ────────────────────────────────────────
const loanColumns: Column<Loan>[] = [
  {
    key: "article",
    header: "Artículo",
    render: (l) => (
      <span className="font-medium text-gray-900">{l.articleName}</span>
    ),
  },
  {
    key: "deliveryDate",
    header: "Entrega",
    width: "120px",
    render: (l) => (
      <span className="text-gray-600">
        {new Date(l.deliveryDate).toLocaleDateString("es-CO", {
          dateStyle: "medium",
        })}
      </span>
    ),
  },
  {
    key: "returnDeadline",
    header: "Límite",
    width: "120px",
    render: (l) => (
      <span className="text-gray-600">
        {new Date(l.returnDeadline).toLocaleDateString("es-CO", {
          dateStyle: "medium",
        })}
      </span>
    ),
  },
  {
    key: "status",
    header: "Estado",
    width: "110px",
    render: (l) => (
      <StatusBadge
        label={loanStatusConfig[l.status].label}
        variant={loanStatusConfig[l.status].variant}
      />
    ),
  },
];

const sanctionColumns: Column<Sanction>[] = [
  {
    key: "type",
    header: "Tipo",
    render: (s) => (
      <span className="font-medium text-gray-900">{s.typeName ?? "—"}</span>
    ),
  },
  {
    key: "reason",
    header: "Motivo",
    render: (s) => (
      <span className="text-gray-600 line-clamp-1">{s.reason}</span>
    ),
  },
  {
    key: "startDate",
    header: "Fecha",
    width: "120px",
    render: (s) => (
      <span className="text-gray-600">
        {new Date(s.startDate).toLocaleDateString("es-CO", {
          dateStyle: "medium",
        })}
      </span>
    ),
  },
  {
    key: "status",
    header: "Estado",
    width: "110px",
    render: (s) => (
      <StatusBadge
        label={sanctionStatusConfig[s.status].label}
        variant={sanctionStatusConfig[s.status].variant}
      />
    ),
  },
];

// ── Component ──────────────────────────────────────
export const StudentLookupPage = () => {
  const [query, setQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<"loans" | "sanctions">("loans");

  const { data: results = [], isLoading: searching } = useQuery({
    queryKey: ["students", "search", query],
    queryFn: () => searchStudent(query),
    enabled: query.length >= 3,
  });

  const { data: loans = [], isLoading: loadingLoans } = useQuery({
    queryKey: ["loans", "student", selectedStudent?.id],
    queryFn: () => fetchStudentLoans(selectedStudent?.id ?? 0),
    enabled: !!selectedStudent,
  });

  const { data: sanctions = [], isLoading: loadingSanctions } = useQuery({
    queryKey: ["sanctions", "student", selectedStudent?.id],
    queryFn: () => fetchStudentSanctions(selectedStudent?.id ?? 0),
    enabled: !!selectedStudent,
  });

  const hasActiveSanction = sanctions.some((s) => s.status === "active");

  const getSearchContent = () => {
  if (searching) {
    return <div className="p-4 text-sm text-gray-400 animate-pulse">Buscando...</div>
  }
  if (results.length === 0) {
    return <div className="p-4 text-sm text-gray-400">No se encontraron estudiantes</div>
  }
  return results.map((student) => (
    <button
      key={student.id}
      onClick={() => { setSelectedStudent(student) }}
      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
    >
      <p className="text-sm font-medium text-gray-900">
        {student.firstName} {student.lastName}
      </p>
      <p className="text-xs text-gray-400">{student.email}</p>
    </button>
  ))
}

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Buscar estudiante"
        description="Consulta el historial de préstamos y sanciones de un estudiante"
      />

      <div className="p-6 flex flex-col gap-6">
        {/* Search */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre o código estudiantil..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedStudent(null);
            }}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1A3A6B] w-full max-w-md"
          />
        </div>

        {/* Search results */}
        {query.length >= 3 && !selectedStudent && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden max-w-md">
            {getSearchContent()}
          </div>
        )}

        {/* Student detail */}
        {selectedStudent && (
          <div className="flex flex-col gap-4">
            {/* Student card */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#1A3A6B]/10 flex items-center justify-center">
                  <span className="text-[#1A3A6B] text-sm font-medium">
                    {selectedStudent.firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {selectedStudent.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {hasActiveSanction && (
                  <StatusBadge label="Sanción activa" variant="danger" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedStudent(null);
                    setQuery("");
                  }}
                >
                  Cambiar
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
              {(["loans", "sanctions"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                  }}
                  className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
                    activeTab === tab
                      ? "bg-white text-gray-900 font-medium shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "loans" ? "Préstamos" : "Sanciones"}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {activeTab === "loans" ? (
                <Table
                  columns={loanColumns}
                  data={loans}
                  keyExtractor={(l) => l.id}
                  isLoading={loadingLoans}
                  emptyMessage="Este estudiante no tiene préstamos registrados"
                />
              ) : (
                <Table
                  columns={sanctionColumns}
                  data={sanctions}
                  keyExtractor={(s) => s.id}
                  isLoading={loadingSanctions}
                  emptyMessage="Este estudiante no tiene sanciones registradas"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
