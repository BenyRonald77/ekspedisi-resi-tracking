"use client";

import { useEffect, useState } from "react";

const STATUS = ["diterima", "transit", "tiba", "diantar", "selesai"];
const inputCls =
  "w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none";

type Hub = { id: number; nama: string; kota: string };

export default function ScanPage() {
  const [hub, setHub] = useState<Hub[]>([]);
  const [hasil, setHasil] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/hub")
      .then((r) => r.json())
      .then((d) => setHub(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasil("");
    setErr("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      no_resi: String(fd.get("no_resi") ?? "").trim().toUpperCase(),
      hub_id: Number(fd.get("hub_id")),
      status: String(fd.get("status")),
      keterangan: String(fd.get("keterangan") ?? ""),
    };
    const r = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await r.json();
    if (!r.ok) {
      setErr(d.error ?? "gagal mencatat scan");
      return;
    }
    setHasil(`Tercatat: ${d.status} pada ${d.waktu}`);
    e.currentTarget.reset();
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Scan Paket di Hub</h2>
      <form onSubmit={submit} className="grid max-w-lg gap-2 rounded bg-white p-4 shadow">
        <input name="no_resi" placeholder="Nomor resi" required className={inputCls} />
        <select name="hub_id" required className={inputCls} defaultValue="">
          <option value="" disabled>
            Pilih hub
          </option>
          {hub.map((h) => (
            <option key={h.id} value={h.id}>
              {h.nama} ({h.kota})
            </option>
          ))}
        </select>
        <select name="status" className={inputCls} defaultValue="transit">
          {STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input name="keterangan" placeholder="Keterangan (opsional)" className={inputCls} />
        <button className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Scan
        </button>
      </form>
      {hasil && (
        <div className="mt-3 rounded bg-green-100 px-3 py-2 text-sm text-green-800">{hasil}</div>
      )}
      {err && (
        <div className="mt-3 rounded bg-red-100 px-3 py-2 text-sm text-red-800">{err}</div>
      )}
    </div>
  );
}
