"use client";

import { useEffect } from "react";

export default function PrintPage() {

  useEffect(() => {

    setTimeout(() => {

      window.print();

    }, 700);

  }, []);

  return (

    <main
      style={{
        padding: "40px",
        fontFamily:
          "Arial, sans-serif",
      }}
    >

      <h1>
        Travel Planner PDF
      </h1>

      <p>
        After print dialog appears,
        choose:
      </p>

      <strong>
        Save as PDF
      </strong>

    </main>
  );
}