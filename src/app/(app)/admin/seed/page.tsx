"use client";

import { useState } from "react";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/admin/seed", {
        method: "POST",
        headers: {
          "Authorization": process.env.NEXT_PUBLIC_SEED_TOKEN
            ? `Bearer ${process.env.NEXT_PUBLIC_SEED_TOKEN}`
            : "",
        },
      });

      if (!response.ok) {
        throw new Error(`Seeding failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Seed Database</h1>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Popula o banco com taxonomia, especialidades, tópicos, perfis de prova e 27
            questões clínicas originais.
          </p>

          <button
            onClick={handleSeed}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            {loading ? "Semeando..." : "Iniciar Seed"}
          </button>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4">
              <p className="text-sm text-red-700 dark:text-red-200">
                <strong>Erro:</strong> {error}
              </p>
            </div>
          )}

          {result?.success && (
            <div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 space-y-2">
              <p className="text-sm text-green-700 dark:text-green-200">
                <strong>✓ Sucesso!</strong> {result.message}
              </p>
              <div className="text-xs text-green-600 dark:text-green-300 space-y-1">
                <p>• {result.stats.areas} áreas</p>
                <p>• {result.stats.specialties} especialidades</p>
                <p>• {result.stats.questions} questões</p>
                <p>• {result.stats.tags} tags</p>
                <p>• {result.stats.profiles} perfis de prova</p>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
          Esta página só aparece em desenvolvimento. Em produção, use:{" "}
          <code className="bg-slate-100 dark:bg-slate-900 px-1 rounded text-xs">
            POST /api/admin/seed
          </code>
        </p>
      </div>
    </div>
  );
}
