"use client";

import { useEffect, useState } from "react";

import PrintHeader from "@/components/PrintHeader";
import PrintLayout from "@/components/PrintLayout";

export default function PrintExportPage() {

  const [data, setData] =
    useState(null);

  useEffect(() => {

    const raw =
      localStorage.getItem(
        "bpv-print-data"
      );

    if (!raw) return;

    setData(JSON.parse(raw));

  }, []);

  if (!data) {
    return null;
  }

  return (

    <main className="min-h-screen bg-[#0f172a] py-10">

      <div className="preview-paper mx-auto w-full max-w-[210mm] overflow-hidden rounded-[28px] bg-white shadow-2xl">

        <PrintHeader
          tripInfo={data.tripInfo}
          region={data.region}
          totalLocal={data.totalLocal}
          totalIDR={data.totalIDR}
        />

        <PrintLayout
          tripInfo={data.tripInfo}
          rows={data.rows}
          dayMap={data.dayMap}
          region={data.region}
          rate={data.rate}
          totalLocal={data.totalLocal}
          totalIDR={data.totalIDR}
        />

      </div>

    </main>
  );
}