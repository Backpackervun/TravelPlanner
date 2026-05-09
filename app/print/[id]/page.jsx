import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import PrintHeader from "@/components/PrintHeader";
import PrintLayout from "@/components/PrintLayout";

export default async function PrintPage({
  params,
}) {

  const id = params?.id;

  if (!id) {
    return null;
  }

  const ref = doc(
    db,
    "pdf_exports",
    id
  );

  const snap =
    await getDoc(ref);

  if (!snap.exists()) {

    return (
      <div className="p-10 text-white">
        Export session not found.
      </div>
    );
  }

  const data = snap.data();

  return (

    <main className="min-h-screen bg-[#0f172a] py-10">

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