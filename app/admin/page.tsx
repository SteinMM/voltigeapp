"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Partner } from "@/lib/types";
import { Suspense } from "react";

interface SyncResult {
  partners?: Partner[];
  total?: number;
  error?: string;
}

interface SaveResult {
  ok?: boolean;
  count?: number;
  url?: string;
  error?: string;
}

function AdminContent() {
  const searchParams = useSearchParams();
  const connected = searchParams.get("connected") === "1";
  const authError = searchParams.get("error");

  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-sync na succesvolle OAuth
  useEffect(() => {
    if (connected) handleSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    setSaveResult(null);
    try {
      const res = await fetch("/api/daisycon/sync");
      const data = await res.json();
      setSyncResult(data);
    } catch {
      setSyncResult({ error: "Netwerk fout bij sync" });
    } finally {
      setSyncing(false);
    }
  }

  async function handleSave() {
    if (!syncResult?.partners) return;
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch("/api/partners/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partners: syncResult.partners }),
      });
      const data = await res.json();
      setSaveResult(data);
    } catch {
      setSaveResult({ error: "Netwerk fout bij opslaan" });
    } finally {
      setSaving(false);
    }
  }

  async function copyJson() {
    if (!syncResult?.partners) return;
    await navigator.clipboard.writeText(JSON.stringify(syncResult.partners, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const hasPartners = syncResult?.partners && syncResult.partners.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto">
      {/* Header */}
      <header className="bg-[#1a3a2a] text-white px-4 py-4">
        <div className="flex items-center gap-3">
          <a href="/" className="text-green-200 text-sm hover:text-white">← App</a>
          <h1 className="text-base font-bold">Admin — Daisycon Sync</h1>
        </div>
      </header>

      <div className="p-4 flex flex-col gap-4">
        {/* Status banner */}
        {authError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 break-words">
            <strong>Fout bij koppelen:</strong> {decodeURIComponent(authError)}
          </div>
        )}
        {connected && !authError && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
            ✓ Succesvol gekoppeld met Daisycon!
          </div>
        )}

        {/* Stap 1: Koppel Daisycon */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="font-semibold text-sm text-gray-800 mb-1">Stap 1 — Koppel Daisycon</h2>
          <p className="text-xs text-gray-500 mb-3">
            Log in met je Daisycon-account om toegang te geven.
          </p>
          <a
            href="/api/auth/daisycon"
            className="block w-full text-center bg-[#1a3a2a] text-white text-sm font-medium py-2.5 rounded-xl hover:bg-[#2a4a3a] transition-colors"
          >
            Koppel Daisycon-account
          </a>
        </div>

        {/* Stap 2: Sync */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="font-semibold text-sm text-gray-800 mb-1">Stap 2 — Haal partners op</h2>
          <p className="text-xs text-gray-500 mb-3">
            Haalt alle goedgekeurde adverteerders op inclusief hun affiliate trackinglink.
          </p>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full bg-green-700 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {syncing ? "Bezig met ophalen…" : "Sync nu"}
          </button>
        </div>

        {/* Stap 3: Save to Live (alleen tonen als sync gelukt is) */}
        {hasPartners && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="font-semibold text-sm text-gray-800 mb-1">Stap 3 — Publiceer naar app</h2>
            <p className="text-xs text-gray-500 mb-3">
              Slaat de {syncResult.total} partners op in Vercel Blob. De homepage wordt direct bijgewerkt.
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-amber-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Bezig met opslaan…" : "Publiceer naar live app"}
            </button>
            {saveResult?.ok && (
              <div className="mt-3 p-2 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700">
                ✓ {saveResult.count} partners opgeslagen. <a href="/" className="underline font-medium">Bekijk de app →</a>
              </div>
            )}
            {saveResult?.error && (
              <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
                Opslaan mislukt: {saveResult.error}
              </div>
            )}
          </div>
        )}

        {/* Resultaten */}
        {syncResult && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            {syncResult.error ? (
              <div>
                <h2 className="font-semibold text-sm text-red-700 mb-1">Fout bij sync</h2>
                <p className="text-xs text-red-600 font-mono break-all">{syncResult.error}</p>
                {syncResult.error.includes("not_authenticated") && (
                  <p className="text-xs text-gray-500 mt-2">
                    Token verlopen — koppel Daisycon opnieuw via stap 1.
                  </p>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-sm text-gray-800">
                    {syncResult.total} partners gevonden
                  </h2>
                  <button
                    onClick={copyJson}
                    className="text-xs text-green-700 font-medium border border-green-200 rounded-lg px-2.5 py-1 hover:bg-green-50 transition-colors"
                  >
                    {copied ? "✓ Gekopieerd!" : "Kopieer JSON"}
                  </button>
                </div>

                <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                  {syncResult.partners?.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-start justify-between gap-2 py-2 border-b border-gray-50 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono truncate">{p.affiliateUrl}</p>
                      </div>
                      <a
                        href={p.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-none text-[10px] text-green-700 border border-green-200 rounded px-1.5 py-0.5 hover:bg-green-50"
                      >
                        Test
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-[10px] text-center text-gray-400 pb-4">
          Publisher ID: 419930 · VoltigeverenigingDeWittegheit
        </p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense>
      <AdminContent />
    </Suspense>
  );
}
