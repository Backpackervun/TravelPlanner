"use client";

import { useEffect, useState } from "react";

export default function PrintPage({ params }) {

  const [mounted, setMounted] =
    useState(false);

  const [data, setData] =
    useState(null);

  useEffect(() => {

    setMounted(true);

    try {

      const raw =
        localStorage.getItem(
          `bpv-export-${params.id}`
        );

      console.log(
        "RAW EXPORT:",
        raw
      );

      if (!raw) return;

      const parsed =
        JSON.parse(raw);

      console.log(
        "PARSED:",
        parsed
      );

      setData(parsed);

    } catch (err) {

      console.error(err);
    }

  }, [params.id]);

  if (!mounted) {
    return null;
  }

  return (

    <main
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        padding: 40,
      }}
    >

      <div
        className="preview-paper"
        style={{
          width: "210mm",
          margin: "0 auto",
          background: "white",
          borderRadius: 24,
          padding: 40,
        }}
      >

        <h1
          style={{
            fontSize: 42,
            fontWeight: 800,
            marginBottom: 20,
          }}
        >
          Backpackervun
        </h1>

        {!data ? (

          <div>
            Loading export...
          </div>

        ) : (

          <>
            <h2
              style={{
                fontSize: 28,
                marginBottom: 20,
              }}
            >
              {data.tripInfo?.clientName}
            </h2>

            <div
              style={{
                marginBottom: 30,
              }}
            >
              {data.tripInfo?.duration}
            </div>

            {data.rows?.map(
              (row, index) => (

                <div
                  key={index}
                  style={{
                    border:
                      "1px solid #ddd",
                    borderRadius: 20,
                    padding: 20,
                    marginBottom: 20,
                  }}
                >

                  <div>
                    {row.time}
                  </div>

                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                    }}
                  >
                    {row.title}
                  </div>

                </div>

              )
            )}
          </>

        )}

      </div>

    </main>
  );
}