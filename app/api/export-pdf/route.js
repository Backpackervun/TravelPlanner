import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const dynamic =
  "force-dynamic";

export const maxDuration = 60;

export async function GET(req) {

  try {

    const { searchParams } =
      new URL(req.url);

    const id =
      searchParams.get("id");

    if (!id) {

      return Response.json(
        {
          error: "Missing ID",
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
        "NEXT_PUBLIC_SITE_URL missing"
      );
    }

    /* ========================================
       LAUNCH BROWSER
    ======================================== */

    const browser =
      await puppeteer.launch({

        args: chromium.args,

        defaultViewport: {

          width: 1440,

          height: 2200,

          deviceScaleFactor: 2,
        },

        executablePath:
          await chromium.executablePath(),

        headless: chromium.headless,
      });

    const page =
      await browser.newPage();

    /* ========================================
       OPEN PRINT PAGE
    ======================================== */

    await page.goto(
      `${baseUrl}/print/${id}?export=true`,
      {
        waitUntil:
          "networkidle0",

        timeout: 60000,
      }
    );

    /* ========================================
       WAIT FOR CONTENT
    ======================================== */

    await page.waitForSelector(
      ".preview-paper",
      {
        timeout: 15000,
      }
    );

    await page.emulateMediaType(
      "screen"
    );

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          1200
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

        displayHeaderFooter: false,

        scale: 1,

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

          "Cache-Control":
            "no-store",
        },
      }
    );

  } catch (err) {

    console.error(
      "PDF ERROR:",
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