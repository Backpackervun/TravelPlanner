"use client";

import { useEffect, useState } from "react";

export default function PrintPage({ params }) {

  const [data, setData] =
    useState(null);

  useEffect(() => {

    const raw =
      localStorage.getItem(
        `bpv-export-${params.id}`
      );

    if (!raw) {
      return;
    }

    setData(JSON.parse(raw));

  }, [params.id]);

  if (!data) {

    return (
      <div
        style={{
          color: "white",
          padding: 40,
        }}
      >
        Loading export...
      </div>
    );
  }

  return (

    <main
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        padding: "40px",
      }}
    >

      <div
        className="preview-paper"
        style={{
          width: "210mm",
          margin: "0 auto",
          background: "white",
          borderRadius: "28px",
          overflow: "hidden",
          padding: "40px",
        }}
      >

        <h1
          style={{
            fontSize: "42px",
            fontWeight: 800,
            marginBottom: "20px",
          }}
        >
          Backpackervun
        </h1>

        <h2
          style={{
            fontSize: "28px",
            marginBottom: "20px",
          }}
        >
          {data.tripInfo?.clientName}
        </h2>

        <div
          style={{
            marginBottom: "40px",
          }}
        >
          {data.tripInfo?.duration}
        </div>

        {data.rows?.map((row, index) => (

          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              borderRadius: "20px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >

            <div
              style={{
                fontSize: "14px",
                opacity: 0.6,
              }}
            >
              {row.time}
            </div>

            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
              }}
            >
              {row.title}
            </div>

            <div
              style={{
                marginTop: "8px",
                opacity: 0.7,
              }}
            >
              {row.description}
            </div>

          </div>

        ))}

      </div>

    </main>
  );
}