"use client";

import { useState } from "react";

const inputCls =
  "w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none";

type Riwayat = {
  waktu: string;
  status: string;
  keterangan: string;
  nama_hub: string;
  kota: string;
};

type Paket = {
  no_resi: string;
  nama_pengirim: string;
  nama_penerima: string;
  alamat_tujuan: string;
  nama_zona: string;
  estimasi_hari: number;
  berat_kg: number;
  dibuat_pada: string;
  status: string;
  riwayat: Riwayat[];
};

export default function LacakPage() {
  const [resi, setResi] = useState("");
  const [paket, setPaket] = useState<Paket | null>(null);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPaket(null);
    setErr("");
    const kode = resi.trim().toUpperCase();
    if (!kode) return;
    const r = await fetch(`/api/lacak/${encodeURIComponent(kode)}`);
    const d = await r.json();
    if (!r.ok) {
      setErr(d.error ?? "resi tidak ditemukan");
      return;
    }
    setPaket(d);
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Lacak Resi</h2>
      <form onSubmit={submit} className="flex max-w-lg gap-2">
        <input
          value={resi}
          onChange={(e) => setResi(e.target.value)}
          placeholder="Nomor resi (contoh EXP-20260929-123456)"
          required
          className={inputCls}
        />
        <button className="shrink-0 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Lacak
        </button>
      </form>
      {err && (
        <div className="mt-3 max-w-lg rounded bg-red-100 px-3 py-2 text-sm text-red-800">
          {err}
        </div>
      )}
      {paket && (
        <div className="mt-4 max-w-2xl rounded bg-white p-4 shadow">
          <h3 className="text-lg font-bold">
            <span className="font-mono">{paket.no_resi}</span>{" "}
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
              {paket.status}
            </span>
          </h3>
          <p className="mt-2 text-sm">
            {paket.nama_pengirim} → <b>{paket.nama_penerima}</b>
          </p>
          <p className="text-sm">
            {paket.alamat_tujuan} ({paket.nama_zona}, estimasi {paket.estimasi_hari} hari)
          </p>
          <p className="text-sm">
            Berat: {paket.berat_kg} kg · Dikirim: {paket.dibuat_pada}
          </p>
          <h4 className="mt-3 font-semibold">Riwayat Perjalanan</h4>
          {paket.riwayat.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada scan.</p>
          ) : (
            <ol className="mt-1 list-inside list-decimal space-y-1 text-sm">
              {paket.riwayat.map((s, i) => (
                <li key={i}>
                  <b>{s.waktu}</b> — {s.nama_hub} ({s.kota}):{" "}
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                    {s.status}
                  </span>
                  {s.keterangan ? ` — ${s.keterangan}` : ""}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
