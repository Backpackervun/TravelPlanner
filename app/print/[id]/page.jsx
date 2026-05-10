"use client";

import { useEffect, useState }
  from "react";

import PrintHeader
  from "@/components/PrintHeader";

import PrintLayout
  from "@/components/PrintLayout";

export default function PrintPage({
  params,
}) {

  const [data, setData] =
    useState(null);

  useEffect(() => {

    const raw =
      localStorage.getItem(
        `bpv-export-${params.id}`
      );

    if (!raw) {

      console.error(
        "EXPORT DATA NOT FOUND"
      );

      return;
    }

    try {

      const parsed =
        JSON.parse(raw);

      setData(parsed);

    } catch (err) {

      console.error(err);
    }

  }, [params.id]);

  if (!data) {

    return (

      <div
        style={{
          padding: 40,
          color: "#fff",
          background: "#0f172a",
          minHeight: "100vh",
        }}
      >
        Loading export...
      </div>
    );
  }

  return (

    <main className="min-h-screen bg-[#0f172a] p-10">

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