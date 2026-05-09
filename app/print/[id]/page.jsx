import PrintHeader from "@/components/PrintHeader";
import PrintLayout from "@/components/PrintLayout";

export default async function PrintPage() {

  /*
    Nanti data trip asli
    akan diambil dari DB/API.
    
    Untuk sekarang sementara
    pakai dummy/test data dulu.
  */

  const tripInfo = {
    clientName: "Ervan",
    duration: "7 Days",
    region: "Australia",
    destinations: "Sydney",
    travelDates: "25 - 31 August 2026",
  };

  const rows = [];

  const dayMap = {};

  const totalLocal = 0;
  const totalIDR = 0;

  return (

    <main className="min-h-screen bg-[#0f172a] py-10">

      <div className="mx-auto w-full max-w-[210mm] overflow-hidden rounded-[28px] bg-white shadow-2xl">

        <PrintHeader
          tripInfo={tripInfo}
          region="Australia"
          totalLocal={totalLocal}
          totalIDR={totalIDR}
        />

        <PrintLayout
          tripInfo={tripInfo}
          rows={rows}
          dayMap={dayMap}
          region="Australia"
          totalLocal={totalLocal}
          totalIDR={totalIDR}
        />

      </div>

    </main>
  );
}