"use client";

import { useEffect, useState } from "react";
import { rupiah } from "@/lib/format";

type Zona = { id: number; nama: string; tarif_per_kg: number; estimasi_hari: number };
type Paket = {
  id: number;
  no_resi: string;
  nama_pengirim: string;
  nama_penerima: string;
  berat_kg: number;
  nama_zona: string;
  ongkir: number;
  status: string;
};

const inputCls =
  "w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none";

export default function PaketPage() {
  const [zona, setZona] = useState<Zona[]>([]);
  const [paket, setPaket] = useState<Paket[]>([]);
  const [hasil, setHasil] = useState("");
  const [err, setErr] = useState("");

  const load = () => {
    fetch("/api/zona")
      .then((r) => r.json())
      .then((d) => setZona(Array.isArray(d) ? d : []))
      .catch(() => {});
    fetch("/api/paket")
      .then((r) => r.json())
      .then((d) => setPaket(Array.isArray(d) ? d : []))
      .catch(() => {});
  };

  useEffect(load, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasil("");
    setErr("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      nama_pengirim: String(fd.get("nama_pengirim") ?? ""),
      nama_penerima: String(fd.get("nama_penerima") ?? ""),
      alamat_tujuan: String(fd.get("alamat_tujuan") ?? ""),
      berat_kg: Number(fd.get("berat_kg")),
      zona_id: Number(fd.get("zona_id")),
    };
    const r = await fetch("/api/paket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await r.json();
    if (!r.ok) {
      setErr(d.error ?? "gagal membuat paket");
      return;
    }
    setHasil(`Paket dibuat! Resi: ${d.no_resi} · Ongkir: ${rupiah(d.ongkir)}`);
    e.currentTarget.reset();
    load();
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Paket</h2>
      <div className="mb-6 overflow-x-auto rounded bg-white shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left">
              <th className="px-3 py-2">Resi</th>
              <th className="px-3 py-2">Pengirim → Penerima</th>
              <th className="px-3 py-2">Berat</th>
              <th className="px-3 py-2">Zona</th>
              <th className="px-3 py-2">Ongkir</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {paket.map((x) => (
              <tr key={x.id} className="border-b">
                <td className="px-3 py-2 font-mono font-bold">{x.no_resi}</td>
                <td className="px-3 py-2">
                  {x.nama_pengirim} → {x.nama_penerima}
                </td>
                <td className="px-3 py-2">{x.berat_kg} kg</td>
                <td className="px-3 py-2">{x.nama_zona}</td>
                <td className="px-3 py-2">{rupiah(x.ongkir)}</td>
                <td className="px-3 py-2">
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                    {x.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="mb-2 font-semibold">Paket Baru</h3>
      <form onSubmit={submit} className="grid max-w-lg gap-2 rounded bg-white p-4 shadow">
        <input name="nama_pengirim" placeholder="Nama pengirim" required className={inputCls} />
        <input name="nama_penerima" placeholder="Nama penerima" required className={inputCls} />
        <input name="alamat_tujuan" placeholder="Alamat tujuan" required className={inputCls} />
        <input
          name="berat_kg"
          type="number"
          step="0.1"
          min="0.1"
          placeholder="Berat (kg)"
          required
          className={inputCls}
        />
        <select name="zona_id" required className={inputCls} defaultValue="">
          <option value="" disabled>
            Pilih zona
          </option>
          {zona.map((z) => (
            <option key={z.id} value={z.id}>
              {z.nama} — {rupiah(z.tarif_per_kg)}/kg (~{z.estimasi_hari} hari)
            </option>
          ))}
        </select>
        <button className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Buat Paket
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
