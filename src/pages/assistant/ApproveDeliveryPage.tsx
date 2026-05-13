import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader, Button, Stepper, StatusBadge } from "../../components/ui";
import { api } from "../../services/api";
import type { Reservation, Sanction, SanctionStatus } from "../../types";

// ── Fetchers / mutations ───────────────────────────
const searchStudent = async (query: string) => {
  const { data } = await api.get<
    { id: number; firstName: string; lastName: string; email: string }[]
  >(`/students/search?q=${query}`);
  return data;
};

const fetchActiveReservation = async (
  studentId: number,
): Promise<Reservation | null> => {
  const { data } = await api.get<Reservation | null>(
    `/reservations/active/${studentId}`,
  );
  return data;
};

const fetchStudentSanctions = async (
  studentId: number,
): Promise<Sanction[]> => {
  const { data } = await api.get<Sanction[]>(`/sanctions/student/${studentId}`);
  return data;
};

const approveDelivery = async (payload: {
  reservationId: number;
  cardReceived: boolean;
}): Promise<void> => {
  await api.post("/loans/approve", payload);
};

const rejectDelivery = async (payload: {
  reservationId: number;
  reason: string;
}): Promise<void> => {
  await api.post("/loans/reject", payload);
};

// ── Status config ──────────────────────────────────
const sanctionStatusConfig: Record<
  SanctionStatus,
  { label: string; variant: "danger" | "neutral" }
> = {
  active: { label: "Activa", variant: "danger" },
  closed: { label: "Cerrada", variant: "neutral" },
};

// ── Steps ──────────────────────────────────────────
const steps = [
  { label: "Buscar estudiante" },
  { label: "Verificar reserva" },
  { label: "Aprobar o rechazar" },
  { label: "Confirmar entrega" },
];

// ── Component ──────────────────────────────────────
export const ApproveDeliveryPage = () => {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [query, setQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [cardReceived, setCardReceived] = useState(false);

  // ── Queries ────────────────────────────────────
  const { data: searchResults = [], isLoading: searching } = useQuery({
    queryKey: ["students", "search", query],
    queryFn: () => searchStudent(query),
    enabled: query.length >= 3,
  });

  const { data: reservation } = useQuery({
    queryKey: ["reservation", "active", selectedStudentId],
    queryFn: () => fetchActiveReservation(selectedStudentId ?? 0),
    enabled: !!selectedStudentId,
  });

  const { data: sanctions = [] } = useQuery({
    queryKey: ["sanctions", "student", selectedStudentId],
    queryFn: () => fetchStudentSanctions(selectedStudentId ?? 0),
    enabled: !!selectedStudentId,
  });

  // ── Mutations ──────────────────────────────────
  const { mutate: approve, isPending: approving } = useMutation({
    mutationFn: () =>
      approveDelivery({
        reservationId: reservation?.id ?? 0,
        cardReceived,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reservation"] });
      setCurrentStep(3);
    },
  });

  const { mutate: reject, isPending: rejecting } = useMutation({
    mutationFn: () =>
      rejectDelivery({
        reservationId: reservation?.id ?? 0,
        reason: rejectReason,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reservation"] });
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

  const handleNext = () => {
    setCurrentStep((s) => s + 1);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedStudentId(null);
    setSelectedStudentName("");
    setDecision(null);
    setRejectReason("");
    setCardReceived(false);
    setQuery("");
  };

  const handleConfirm = () => {
    if (decision === "approve") {
      approve();
    } else {
      reject();
    }
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

  const hasActiveSanction = sanctions.some((s) => s.status === "active");

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Aprobar entrega"
        description="Verifica la reserva del estudiante y registra la entrega del artículo"
      />

      <div className="p-6 max-w-3xl flex flex-col gap-6">
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

        {/* ── Step 1: Verify reservation ── */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reservation card */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3">
                <h3 className="text-sm font-medium text-gray-900">
                  Reserva activa
                </h3>

                {reservation ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Artículo</span>
                      <span className="font-medium text-gray-700">
                        {reservation.articleName}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Estudiante</span>
                      <span className="text-gray-700">
                        {selectedStudentName}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Reclamar antes de</span>
                      <span className="text-amber-600 font-medium text-xs">
                        {new Date(reservation.claimDeadline).toLocaleString(
                          "es-CO",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-sm text-red-600">
                      Este estudiante no tiene reserva activa
                    </p>
                  </div>
                )}
              </div>

              {/* Sanction history */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">
                    Historial de sanciones
                  </h3>
                  {hasActiveSanction && (
                    <StatusBadge label="Sanción activa" variant="danger" />
                  )}
                </div>

                {sanctions.length === 0 ? (
                  <p className="text-sm text-green-600">
                    Sin sanciones registradas
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {sanctions.slice(0, 4).map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-gray-600 line-clamp-1 flex-1">
                          {s.reason}
                        </span>
                        <StatusBadge
                          label={sanctionStatusConfig[s.status].label}
                          variant={sanctionStatusConfig[s.status].variant}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={handleReset}>
                Cancelar
              </Button>
              <Button disabled={!reservation} onClick={handleNext}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Approve or reject ── */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-5">
            <h2 className="text-sm font-medium text-gray-900">
              ¿Aprobar o rechazar la entrega?
            </h2>

            {/* Decision cards */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setDecision("approve");
                }}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${
                  decision === "approve"
                    ? "border-[#0F6E56] bg-green-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <p className="text-sm font-medium text-gray-900">
                  Aprobar entrega
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  El artículo será entregado al estudiante
                </p>
              </button>

              <button
                onClick={() => {
                  setDecision("reject");
                }}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${
                  decision === "reject"
                    ? "border-[#A32D2D] bg-red-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <p className="text-sm font-medium text-gray-900">
                  Rechazar entrega
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  La reserva será cancelada con un motivo
                </p>
              </button>
            </div>

            {/* Reject reason */}
            {decision === "reject" && (
              <div>
                <label
                  htmlFor="rejectReason"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Motivo del rechazo
                </label>
                <textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                  }}
                  rows={3}
                  placeholder="Describe el motivo del rechazo..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1A3A6B] resize-none"
                />
              </div>
            )}

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
                disabled={
                  !decision ||
                  (decision === "reject" && rejectReason.trim().length === 0)
                }
                onClick={handleNext}
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Confirm delivery ── */}
        {currentStep === 3 && decision === "approve" && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-5">
            <h2 className="text-sm font-medium text-gray-900">
              Confirmar entrega
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
                <span className="text-gray-700">
                  {reservation?.articleName}
                </span>
              </div>
            </div>

            {/* Card checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={cardReceived}
                onChange={(e) => {
                  setCardReceived(e.target.checked);
                }}
                className="mt-0.5 w-4 h-4 accent-[#1A3A6B]"
              />
              <span className="text-sm text-gray-700">
                Confirmo que recibí el carnet estudiantil como garantía física
              </span>
            </label>

            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setCurrentStep(2);
                }}
              >
                Volver
              </Button>
              <Button
                disabled={!cardReceived}
                isLoading={approving}
                onClick={handleConfirm}
              >
                Confirmar entrega
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Reject confirmation ── */}
        {currentStep === 3 && decision === "reject" && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-5">
            <h2 className="text-sm font-medium text-gray-900">
              Confirmar rechazo
            </h2>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700 font-medium">
                Motivo del rechazo
              </p>
              <p className="text-sm text-red-600 mt-1">{rejectReason}</p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setCurrentStep(2);
                }}
              >
                Volver
              </Button>
              <Button
                variant="danger"
                isLoading={rejecting}
                onClick={handleConfirm}
              >
                Confirmar rechazo
              </Button>
            </div>
          </div>
        )}

        {/* ── Success ── */}
        {currentStep === 4 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-2xl">✓</span>
            </div>
            <h2 className="text-base font-medium text-gray-900">
              {decision === "approve"
                ? "¡Entrega registrada!"
                : "Rechazo registrado"}
            </h2>
            <p className="text-sm text-gray-400">
              {decision === "approve"
                ? "El préstamo ha sido activado correctamente"
                : "La reserva ha sido cancelada y el estudiante fue notificado"}
            </p>
            <Button onClick={handleReset}>Nueva entrega</Button>
          </div>
        )}
      </div>
    </div>
  );
};
