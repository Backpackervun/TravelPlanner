import { NextResponse } from "next/server";

import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export async function POST(request) {

  try {

    const body =
      await request.json();

    const html =
      body.html;

    if (!html) {

      return NextResponse.json(
        {
          error:
            "Missing HTML",
        },
        {
          status: 400,
        }
      );
    }

    const browser =
      await puppeteer.launch({

        args:
          chromium.args,

        defaultViewport: {
          width: 1440,
          height: 2000,
        },

        executablePath:
          await chromium.executablePath(),

        headless: true,
      });

    const page =
      await browser.newPage();

    await page.setContent(
      html,
      {
        waitUntil:
          "networkidle0",
      }
    );

    const pdf =
      await page.pdf({

        format: "A4",

        printBackground: true,

        margin: {

          top: "12mm",

          right: "12mm",

          bottom: "12mm",

          left: "12mm",
        },
      });

    await browser.close();

    return new NextResponse(
      pdf,
      {

        headers: {

          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            'attachment; filename="travel-itinerary.pdf"',
        },
      }
    );

  } catch (err) {

    console.error(err);

    return NextResponse.json(
      {
        error:
          "Failed to generate PDF",
      },
      {
        status: 500,
      }
    );
  }
}