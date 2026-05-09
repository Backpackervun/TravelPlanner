import PrintHeader from "@/components/PrintHeader";
import PrintLayout from "@/components/PrintLayout";

export default function PrintPage() {

  const tripInfo = {
    id: "demo",
    clientName: "Ervan",
    duration: "5 Days 4 Nights",
    destinations: "Tokyo",
    travelDates: "2026-05-11 – 2026-05-15",
  };

  const rows = [
    {
      date: "2026-05-11",
      time: "05:35",
      destination: "Narita Airport",
      from: "Soekarno Hatta Airport",
      to: "Narita Airport",
      transportType: "Flight",
      budgetLocal: 90090,
    },

    {
      date: "2026-05-12",
      time: "06:38",
      destination: "Asakusa Station",
      from: "Narita Airport",
      to: "Asakusa Station",
      transportType: "Train",
      budgetLocal: 1100,
    },
  ];

  const dayMap = {
    "2026-05-11": 1,
    "2026-05-12": 2,
  };

  return (

    <main className="min-h-screen bg-[#0f172a] py-10">

      <div className="mx-auto w-full max-w-[210mm] overflow-hidden rounded-[28px] bg-white shadow-2xl">

        <PrintHeader
          tripInfo={tripInfo}
          region="Japan"
          totalLocal={91190}
          totalIDR={10121815}
        />

        <PrintLayout
          tripInfo={tripInfo}
          rows={rows}
          dayMap={dayMap}
          region="Japan"
          totalLocal={91190}
          totalIDR={10121815}
        />

      </div>

    </main>
  );
}