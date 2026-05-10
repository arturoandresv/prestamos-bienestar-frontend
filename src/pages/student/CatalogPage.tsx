import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, StatusBadge } from "../../components/ui";
import { api } from "../../services/api";
import type { Article, ArticleStatus } from "../../types";

// ── Fetch articles ─────────────────────────────────
const fetchArticles = async (): Promise<Article[]> => {
  const { data } = await api.get<Article[]>("/articles");
  return data;
};

// ── Status badge mapper ────────────────────────────
const statusConfig: Record<
  ArticleStatus,
  { label: string; variant: "success" | "danger" | "neutral" }
> = {
  available: { label: "Disponible", variant: "success" },
  out_of_stock: { label: "Agotado", variant: "danger" },
  inactive: { label: "Inactivo", variant: "neutral" },
};

// ── Component ──────────────────────────────────────
export const CatalogPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["articles"],
    queryFn: fetchArticles,
  });

  // ── Filter logic ───────────────────────────────
  const categories = ["all", ...new Set(articles.map((a) => a.typeName))];

  const filtered = articles.filter((article) => {
    const matchesSearch = article.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = category === "all" || article.typeName === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Catálogo de artículos"
        description="Consulta los artículos disponibles para préstamo"
      />

      <div className="p-6 flex flex-col gap-6">
        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1A3A6B] w-64"
          />
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
            }}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1A3A6B] bg-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "Todas las categorías" : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((id) => (
              <div
                key={id}
                className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse"
              >
                <div className="h-40 bg-gray-100 rounded-lg mb-4" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-gray-400 text-sm">
              No se encontraron artículos con esos filtros
            </p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((article) => {
              const status = statusConfig[article.status];
              const isAvailable = article.status === "available";

              return (
                <button
                  key={article.id}
                  disabled={!isAvailable}
                  onClick={() => {
                    navigate(`/catalog/${article.id}`);
                  }}
                  className={`bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-3 transition-shadow text-left w-full ${
                    isAvailable
                      ? "hover:shadow-md cursor-pointer"
                      : "opacity-60 cursor-not-allowed"
                  }`}
                >
                  {/* Image placeholder */}
                  <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center">
                    <span className="text-gray-300 text-sm">Sin imagen</span>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-gray-900 leading-tight">
                        {article.name}
                      </h3>
                      <StatusBadge
                        label={status.label}
                        variant={status.variant}
                      />
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {article.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                    <span className="text-xs text-gray-400">
                      {article.typeName}
                    </span>
                    <span className="text-xs font-medium text-[#0F6E56]">
                      {article.availableQuantity} disponibles
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
