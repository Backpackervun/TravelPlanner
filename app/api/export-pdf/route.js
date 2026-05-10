import puppeteer from "puppeteer-core";

import chromium from "@sparticuz/chromium";

export const dynamic =
  "force-dynamic";

export const maxDuration =
  60;

export async function GET(req) {

  try {

    const { searchParams } =
      new URL(req.url);

    const id =
      searchParams.get("id");

    if (!id) {

      return Response.json(
        {
          error:
            "Missing export ID",
        },
        {
          status: 400,
        }
      );
    }

    const baseUrl =
      process.env
        .NEXT_PUBLIC_SITE_URL;

    if (!baseUrl) {

      throw new Error(
        "NEXT_PUBLIC_SITE_URL is missing"
      );
    }

    /* ========================================
       LAUNCH CHROMIUM
    ======================================== */

    const browser =
      await puppeteer.launch({

        args: chromium.args,

        executablePath:
          await chromium.executablePath(),

        headless: true,
      });

    const page =
      await browser.newPage();

    /* ========================================
       OPEN LIVE PREVIEW PAGE
    ======================================== */

    await page.goto(

      `${baseUrl}/print/${id}`,

      {

        waitUntil:
          "networkidle0",

        timeout: 60000,
      }
    );

    /* ========================================
       WAIT RENDER
    ======================================== */

    await page.waitForSelector(
      ".preview-paper",
      {
        timeout: 30000,
      }
    );

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          1500
        )
    );

    /* ========================================
       GENERATE PDF
    ======================================== */

    const pdf =
      await page.pdf({

        format: "A4",

        printBackground: true,

        preferCSSPageSize: true,

        margin: {

          top: "0px",
          right: "0px",
          bottom: "0px",
          left: "0px",
        },
      });

    await browser.close();

    /* ========================================
       RETURN PDF
    ======================================== */

    return new Response(
      pdf,
      {

        headers: {

          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            'attachment; filename="backpackervun-itinerary.pdf"',
        },
      }
    );

  } catch (err) {

    console.error(
      "EXPORT PDF ERROR:",
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