export default function PrintPage() {

  return (

    <main
      style={{
        background: "#fff",
        padding: "40px",
        fontFamily:
          "Arial, sans-serif",
      }}
    >

      {/* COVER */}

      <section>

        <h1
          style={{
            fontSize: "48px",
            marginBottom: "12px",
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

      {/* DAY 1 */}

      <section
        style={{
          marginTop: "60px",
        }}
      >

        <div
          style={{
            display: "inline-block",
            padding:
              "8px 16px",
            borderRadius: "999px",
            background: "#111827",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          DAY 1
        </div>

        <h2
          style={{
            marginTop: "20px",
            fontSize: "36px",
          }}
        >
          Arrival Sydney
        </h2>

        <p
          style={{
            color: "#666",
          }}
        >
          Thursday, 10 September 2026
        </p>

        {/* CARD */}

        <div
          style={{
            marginTop: "30px",
            border:
              "1px solid #e5e7eb",
            borderRadius: "24px",
            padding: "24px",
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
                  "#eef2ff",
                color:
                  "#2563eb",
                padding:
                  "8px 14px",
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

          <h3
            style={{
              marginTop: "20px",
              fontSize: "28px",
            }}
          >
            Arrive Sydney Airport
          </h3>

          <p
            style={{
              color: "#666",
              lineHeight: 1.8,
            }}
          >
            Immigration process
            and airport transfer.
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

        </div>

      </section>

    </main>
  );
}