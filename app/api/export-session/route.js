import { db } from "@/lib/firebase";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export async function POST(req) {

  try {

    const body =
      await req.json();

    const ref =
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
      id: ref.id,
    });

  } catch (err) {

    console.error(err);

    return Response.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}