"use client";

import { useState, useMemo, useCallback } from "react";
import Fuse from "fuse.js";
import { Partner, CATEGORIES } from "@/lib/types";
import { PartnerCard } from "./PartnerCard";

interface Props {
  partners: Partner[];
}

export function PartnersClient({ partners }: Props) {
  const [query, setQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());

  const fuse = useMemo(
    () =>
      new Fuse(partners, {
        keys: [
          { name: "name", weight: 2 },
          { name: "tags", weight: 1.5 },
          { name: "description", weight: 1 },
          { name: "categories", weight: 1 },
        ],
        threshold: 0.35,
        includeScore: true,
      }),
    [partners]
  );

  const toggleCategory = useCallback((cat: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setQuery("");
    setActiveCategories(new Set());
  }, []);

  const filtered = useMemo(() => {
    let result = query.trim()
      ? fuse.search(query).map((r) => r.item)
      : [...partners].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    if (activeCategories.size > 0) {
      result = result.filter((p) =>
        p.categories.some((c) => activeCategories.has(c))
      );
    }

    return result;
  }, [query, activeCategories, fuse, partners]);

  const hasFilters = query.trim() || activeCategories.size > 0;

  return (
    <div className="flex flex-col min-h-0">
      {/* Zoekbalk */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoek een merk of winkel…"
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent placeholder:text-gray-400"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Categorie-chips */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map((cat) => {
            const active = activeCategories.has(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`flex-none text-xs font-medium px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                  active
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-white text-gray-600 border-gray-200 hover:border-green-600 hover:text-green-700"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resultaatinfo */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {filtered.length} partner{filtered.length !== 1 ? "s" : ""} gevonden
        </p>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-green-700 font-medium hover:underline"
          >
            Wis filters
          </button>
        )}
      </div>

      {/* Partnerlijst */}
      <div className="px-4 pb-8 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-3 opacity-40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium">Geen partners gevonden</p>
            <p className="text-xs mt-1">Probeer een andere zoekterm of filter</p>
          </div>
        ) : (
          filtered.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))
        )}
      </div>
    </div>
  );
}
