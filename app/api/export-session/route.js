import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export const dynamic =
  "force-dynamic";

export async function POST(req) {

  try {

    const body =
      await req.json();

    const docRef =
      await addDoc(

        collection(
          db,
          "pdf_exports"
        ),

        {

          ...body,

          createdAt:
            serverTimestamp(),
        }
      );

    return Response.json({

      success: true,

      id: docRef.id,
    });

  } catch (err) {

    console.error(
      "EXPORT SESSION ERROR:",
      err
    );

    return Response.json(
      {
        error: String(err),
      },
      {
        status: 500,
      }
    );
  }
}