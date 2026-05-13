import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader, Button, Stepper, StatusBadge } from "../../components/ui";
import { api } from "../../services/api";
import type { Loan, LoanStatus } from "../../types";

// ── Fetchers / mutations ───────────────────────────
const searchStudent = async (query: string) => {
  const { data } = await api.get<
    { id: number; firstName: string; lastName: string; email: string }[]
  >(`/students/search?q=${query}`);
  return data;
};

const fetchActiveLoan = async (studentId: number): Promise<Loan | null> => {
  const { data } = await api.get<Loan | null>(`/loans/active/${studentId}`);
  return data;
};

const registerReturn = async (payload: {
  loanId: number;
  condition: "good_condition" | "poor_condition";
  sanctionReason?: string;
  sanctionTypeId?: number;
  cardReturned: boolean;
}): Promise<void> => {
  await api.post("/returns", payload);
};

// ── Status config ──────────────────────────────────
const loanStatusConfig: Record<
  LoanStatus,
  { label: string; variant: "success" | "danger" | "neutral" }
> = {
  active: { label: "Activo", variant: "success" },
  closed: { label: "Cerrado", variant: "neutral" },
  overdue: { label: "Vencido", variant: "danger" },
};

// ── Steps ──────────────────────────────────────────
const steps = [
  { label: "Buscar estudiante" },
  { label: "Estado del artículo" },
  { label: "Confirmar devolución" },
];

// ── Component ──────────────────────────────────────
export const RegisterReturnPage = () => {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [query, setQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [condition, setCondition] = useState<
    "good_condition" | "poor_condition" | null
  >(null);
  const [sanctionReason, setSanctionReason] = useState("");
  const [cardReturned, setCardReturned] = useState(false);

  // ── Queries ────────────────────────────────────
  const { data: searchResults = [], isLoading: searching } = useQuery({
    queryKey: ["students", "search", query],
    queryFn: () => searchStudent(query),
    enabled: query.length >= 3,
  });

  const { data: activeLoan } = useQuery({
    queryKey: ["loan", "active", selectedStudentId],
    queryFn: () => fetchActiveLoan(selectedStudentId ?? 0),
    enabled: !!selectedStudentId,
  });

  // ── Mutation ───────────────────────────────────
  const { mutate: submitReturn, isPending } = useMutation({
    mutationFn: () =>
      registerReturn({
        loanId: activeLoan?.id ?? 0,
        condition: condition ?? "good_condition",
        sanctionReason:
          condition === "poor_condition" ? sanctionReason : undefined,
        cardReturned,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["loan"] });
      void queryClient.invalidateQueries({ queryKey: ["articles"] });
      setCurrentStep(3);
    },
  });

  // ── Handlers ───────────────────────────────────
  const handleSelectStudent = (id: number, name: string) => {
    setSelectedStudentId(id);
    setSelectedStudentName(name);
    setQuery("");
    setCurrentStep(1);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedStudentId(null);
    setSelectedStudentName("");
    setCondition(null);
    setSanctionReason("");
    setCardReturned(false);
    setQuery("");
  };

  const getSearchResults = () => {
    if (searching) {
      return (
        <div className="p-4 text-sm text-gray-400 animate-pulse">
          Buscando...
        </div>
      );
    }
    if (searchResults.length === 0) {
      return (
        <div className="p-4 text-sm text-gray-400">
          No se encontraron estudiantes
        </div>
      );
    }
    return searchResults.map((s) => (
      <button
        key={s.id}
        onClick={() => {
          handleSelectStudent(s.id, `${s.firstName} ${s.lastName}`);
        }}
        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
      >
        <p className="text-sm font-medium text-gray-900">
          {s.firstName} {s.lastName}
        </p>
        <p className="text-xs text-gray-400">{s.email}</p>
      </button>
    ));
  };

  const isOverdue = activeLoan?.status === "overdue";

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Registrar devolución"
        description="Registra la devolución física de un artículo prestado"
      />

      <div className="p-6 max-w-2xl flex flex-col gap-6">
        {/* Stepper */}
        <Stepper steps={steps} currentStep={currentStep} />

        {/* ── Step 0: Search student ── */}
        {currentStep === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-4">
            <h2 className="text-sm font-medium text-gray-900">
              Buscar estudiante
            </h2>

            <input
              type="text"
              placeholder="Nombre o código estudiantil..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1A3A6B]"
            />

            {query.length >= 3 && (
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                {getSearchResults()}
              </div>
            )}
          </div>
        )}

        {/* ── Step 1: Article condition ── */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-4">
            {/* Active loan card */}
            {activeLoan && (
              <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">
                    Préstamo activo
                  </h3>
                  <StatusBadge
                    label={loanStatusConfig[activeLoan.status].label}
                    variant={loanStatusConfig[activeLoan.status].variant}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Artículo</span>
                    <span className="font-medium text-gray-700">
                      {activeLoan.articleName}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Estudiante</span>
                    <span className="text-gray-700">{selectedStudentName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Fecha límite</span>
                    <span
                      className={`text-sm font-medium ${isOverdue ? "text-red-600" : "text-gray-700"}`}
                    >
                      {new Date(activeLoan.returnDeadline).toLocaleDateString(
                        "es-CO",
                        { dateStyle: "medium" },
                      )}
                    </span>
                  </div>
                </div>

                {/* Overdue warning */}
                {isOverdue && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <p className="text-xs text-red-700">
                      ⚠ Este préstamo está vencido. Se aplicará una sanción
                      automáticamente.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Condition selector */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-4">
              <h3 className="text-sm font-medium text-gray-900">
                Estado del artículo devuelto
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setCondition("good_condition");
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-colors ${
                    condition === "good_condition"
                      ? "border-[#0F6E56] bg-green-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <p className="text-2xl mb-2">✓</p>
                  <p className="text-sm font-medium text-gray-900">
                    Buen estado
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    El artículo fue devuelto en condiciones aceptables
                  </p>
                </button>

                <button
                  onClick={() => {
                    setCondition("poor_condition");
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-colors ${
                    condition === "poor_condition"
                      ? "border-[#A32D2D] bg-red-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <p className="text-2xl mb-2">✕</p>
                  <p className="text-sm font-medium text-gray-900">
                    Mal estado
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    El artículo presenta daños o deterioro
                  </p>
                </button>
              </div>

              {/* Poor condition warning + sanction form */}
              {condition === "poor_condition" && (
                <div className="flex flex-col gap-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    <p className="text-sm text-amber-700 font-medium">
                      ⚠ Se registrará una sanción antes de cerrar este préstamo
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      El estudiante quedará bloqueado para nuevas reservas hasta
                      que el auxiliar cierre la sanción.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="sanctionReason"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Motivo de la sanción
                    </label>
                    <textarea
                      id="sanctionReason"
                      value={sanctionReason}
                      onChange={(e) => {
                        setSanctionReason(e.target.value);
                      }}
                      rows={3}
                      placeholder="Describe el daño o deterioro del artículo..."
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1A3A6B] resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={handleReset}>
                Cancelar
              </Button>
              <Button
                disabled={
                  !condition ||
                  (condition === "poor_condition" &&
                    sanctionReason.trim().length === 0)
                }
                onClick={() => {
                  setCurrentStep(2);
                }}
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Confirm return ── */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-5">
            <h2 className="text-sm font-medium text-gray-900">
              Confirmar devolución
            </h2>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4 flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estudiante</span>
                <span className="font-medium text-gray-700">
                  {selectedStudentName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Artículo</span>
                <span className="text-gray-700">{activeLoan?.articleName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estado</span>
                <span
                  className={`text-sm font-medium ${
                    condition === "good_condition"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {condition === "good_condition"
                    ? "Buen estado"
                    : "Mal estado"}
                </span>
              </div>
            </div>

            {/* Sanction summary */}
            {condition === "poor_condition" && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-700 font-medium">
                  Sanción a aplicar
                </p>
                <p className="text-xs text-amber-600 mt-1">{sanctionReason}</p>
              </div>
            )}

            {/* Card returned checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={cardReturned}
                onChange={(e) => {
                  setCardReturned(e.target.checked);
                }}
                className="mt-0.5 w-4 h-4 accent-[#1A3A6B]"
              />
              <span className="text-sm text-gray-700">
                Confirmo que devolví el carnet estudiantil al estudiante
              </span>
            </label>

            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setCurrentStep(1);
                }}
              >
                Volver
              </Button>
              <Button
                disabled={!cardReturned}
                isLoading={isPending}
                onClick={() => {
                  submitReturn();
                }}
              >
                Registrar devolución
              </Button>
            </div>
          </div>
        )}

        {/* ── Success ── */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-2xl">✓</span>
            </div>
            <h2 className="text-base font-medium text-gray-900">
              ¡Devolución registrada!
            </h2>
            <p className="text-sm text-gray-400">
              {condition === "poor_condition"
                ? "La devolución fue registrada y se aplicó una sanción al estudiante"
                : "La devolución fue registrada correctamente"}
            </p>
            <Button onClick={handleReset}>Nueva devolución</Button>
          </div>
        )}
      </div>
    </div>
  );
};
