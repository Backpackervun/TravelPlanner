export default function PrintPage() {

  return (

    <main
      style={{
        padding: "40px",
        background: "#ffffff",
        color: "#111111",
        fontFamily:
          "Arial, sans-serif",
      }}
    >

      <h1
        style={{
          fontSize: "32px",
          marginBottom: "20px",
        }}
      >
        Travel Planner PDF
      </h1>

      <p
        style={{
          fontSize: "16px",
          lineHeight: 1.8,
        }}
      >
        This is the server-side
        generated PDF page for
        Backpackervun Travel Planner.
      </p>

      <div
        style={{
          marginTop: "40px",
          padding: "24px",
          border: "1px solid #e5e7eb",
          borderRadius: "20px",
        }}
      >

        <h2>
          Sydney Marathon 2026
        </h2>

        <p>
          Sydney • Blue Mountains
          • Bondi
        </p>

      </div>

    </main>
  );
}