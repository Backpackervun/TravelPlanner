import { adminDb }
  from "@/lib/firebase-admin";

import PrintHeader
  from "@/components/PrintHeader";

import PrintLayout
  from "@/components/PrintLayout";

export const dynamic =
  "force-dynamic";

export default async function Page({
  params,
}) {

  try {

    const snap =
      await adminDb

        .collection(
          "pdf_exports"
        )

        .doc(params.id)

        .get();

    if (!snap.exists) {

      return (
        <div
          style={{
            padding: 40,
          }}
        >
          Export not found
        </div>
      );
    }

    const data =
      snap.data();

    return (

      <main className="min-h-screen bg-[#0f172a] p-10">

        <div className="preview-paper mx-auto w-full max-w-[210mm] overflow-hidden rounded-[28px] bg-white shadow-2xl">

          <PrintHeader
            tripInfo={
              data.tripInfo
            }
            region={
              data.region
            }
            totalLocal={
              data.totalLocal
            }
            totalIDR={
              data.totalIDR
            }
          />

          <PrintLayout
            tripInfo={
              data.tripInfo
            }
            rows={
              data.rows
            }
            dayMap={
              data.dayMap
            }
            region={
              data.region
            }
            rate={
              data.rate
            }
            totalLocal={
              data.totalLocal
            }
            totalIDR={
              data.totalIDR
            }
          />

        </div>

      </main>
    );

  } catch (err) {

    console.error(err);

    return (
      <div
        style={{
          padding: 40,
        }}
      >
        Failed to load export
      </div>
    );
  }
}