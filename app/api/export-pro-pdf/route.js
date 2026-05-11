import { NextResponse } from "next/server";

import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://travelplanner.backpackervun.com";

export async function GET() {

  try {

    const browser =
      await puppeteer.launch({

        args:
          chromium.args,

        executablePath:
          await chromium.executablePath(),

        headless: true,
      });

    const page =
      await browser.newPage();

    await page.goto(
      `${SITE_URL}/pro-print`,
      {
        waitUntil:
          "networkidle0",
      }
    );

    const pdf =
      await page.pdf({

        format: "A4",

        printBackground: true,

        preferCSSPageSize: true,

        margin: {
          top: "20px",
          right: "20px",
          bottom: "20px",
          left: "20px",
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
            'inline; filename="travel-pro-itinerary.pdf"',
        },
      }
    );

  } catch (err) {

    console.error(err);

    return NextResponse.json(
      {
        error:
          err.message,
      },
      {
        status: 500,
      }
    );
  }
}