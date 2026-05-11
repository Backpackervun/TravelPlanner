export default function ProPrintPage() {

  return (

    <main
      style={{
        background: "#ffffff",
        padding: "40px",
        fontFamily:
          "Arial, sans-serif",
      }}
    >

      <section>

        <h1
          style={{
            fontSize: "48px",
            marginBottom: "10px",
          }}
        >
          Sydney Marathon 2026
        </h1>

        <p
          style={{
            color: "#666",
            fontSize: "18px",
          }}
        >
          Sydney • Blue Mountains • Bondi
        </p>

      </section>

      {/* CARD */}

      <div
        style={{
          marginTop: "40px",
          border:
            "1px solid #e5e7eb",
          borderRadius: "24px",
          padding: "24px",
          pageBreakInside:
            "avoid",
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
          }}
        >

          <div
            style={{
              background:
                "#eff6ff",
              color:
                "#2563eb",
              padding:
                "10px 16px",
              borderRadius:
                "999px",
              fontWeight: 700,
            }}
          >
            08:00
          </div>

          <div
            style={{
              color:
                "#059669",
              fontWeight: 700,
            }}
          >
            AUD 20
          </div>

        </div>

        <h2
          style={{
            marginTop: "24px",
            fontSize: "32px",
          }}
        >
          Arrive Sydney Airport
        </h2>

        <p
          style={{
            color: "#666",
            lineHeight: 1.8,
          }}
        >
          Immigration process and airport transfer.
        </p>

        <img
          src="https://images.unsplash.com/photo-1506973035872-a4ec16b8d5c1?q=80&w=1400"
          style={{
            width: "100%",
            borderRadius:
              "20px",
            marginTop: "20px",
          }}
        />

        {/* CLICKABLE LINKS */}

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >

          <a
            href="https://maps.google.com/?q=Sydney+Airport"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              border:
                "1px solid #d1d5db",
              padding:
                "12px 18px",
              borderRadius:
                "999px",
              textDecoration:
                "none",
              color: "#111827",
              fontWeight: 700,
            }}
          >
            📍 Open Maps
          </a>

          <a
            href="https://www.booking.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              border:
                "1px solid #d1d5db",
              padding:
                "12px 18px",
              borderRadius:
                "999px",
              textDecoration:
                "none",
              color: "#111827",
              fontWeight: 700,
            }}
          >
            🏨 Hotel
          </a>

        </div>

      </div>

    </main>
  );
}