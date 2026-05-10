import { NextResponse } from "next/server";

import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export async function POST(request) {

  try {

    const formData =
      await request.formData();

    const html =
      formData.get("html");

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

        executablePath:
          await chromium.executablePath(),

        headless: true,
      });

    const page =
      await browser.newPage();

    await page.setViewport({
      width: 1440,
      height: 2000,
    });

    await page.setContent(
      `
      <html>
        <head>
          <style>

            body{
              margin:0;
              padding:20px;
              font-family:Arial,sans-serif;
              background:white;
            }

            img{
              max-width:100%;
            }

          </style>
        </head>

        <body>
          ${html}
        </body>
      </html>
      `,
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
      });

    await browser.close();

    return new NextResponse(
      pdf,
      {

        headers: {

          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            'inline; filename="travel-itinerary.pdf"',
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