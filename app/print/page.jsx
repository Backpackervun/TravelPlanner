"use client";

import { useEffect } from "react";

export default function PrintPage() {

  useEffect(() => {

    setTimeout(() => {

      window.print();

    }, 1000);

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
        Safari iOS will now open
        native print dialog.
      </p>

      <p>
        Tap:
      </p>

      <strong>
        Save as PDF
      </strong>

    </main>
  );
}