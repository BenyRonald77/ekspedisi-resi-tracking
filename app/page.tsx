"use client";

import { useEffect, useState } from "react";
import { rupiah } from "@/lib/format";

type Ringkasan = {
  per_status: { status: string; jumlah: number }[];
  total_paket: number;
  total_ongkir: number;
};

type Paket = {
  id: number;
  no_resi: string;
  nama_penerima: string;
  nama_zona: string;
  status: string;
};

export default function Dashboard() {
  const [ringkasan, setRingkasan] = useState<Ringkasan | null>(null);
  const [paket, setPaket] = useState<Paket[]>([]);

  useEffect(() => {
    fetch("/api/ringkasan")
      .then((r) => r.json())
      .then(setRingkasan)
      .catch(() => {});
    fetch("/api/paket")
      .then((r) => r.json())
      .then((d) => setPaket(Array.isArray(d) ? d.slice(0, 10) : []))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Dashboard</h2>
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded bg-white p-4 shadow">
          <h4 className="text-sm text-slate-500">Total paket</h4>
          <p className="text-2xl font-bold">{ringkasan?.total_paket ?? "-"}</p>
        </div>
        <div className="rounded bg-white p-4 shadow">
          <h4 className="text-sm text-slate-500">Total ongkir</h4>
          <p className="text-2xl font-bold">{rupiah(ringkasan?.total_ongkir ?? 0)}</p>
        </div>
        {(ringkasan?.per_status ?? []).map((x) => (
          <div key={x.status} className="rounded bg-white p-4 shadow">
            <h4 className="text-sm text-slate-500 capitalize">{x.status}</h4>
            <p className="text-2xl font-bold">{x.jumlah}</p>
          </div>
        ))}
      </div>
      <h3 className="mb-2 font-semibold">Paket Terbaru</h3>
      <div className="overflow-x-auto rounded bg-white shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left">
              <th className="px-3 py-2">Resi</th>
              <th className="px-3 py-2">Penerima</th>
              <th className="px-3 py-2">Tujuan</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {paket.map((x) => (
              <tr key={x.id} className="border-b">
                <td className="px-3 py-2 font-mono">{x.no_resi}</td>
                <td className="px-3 py-2">{x.nama_penerima}</td>
                <td className="px-3 py-2">{x.nama_zona}</td>
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
    </div>
  );
}
