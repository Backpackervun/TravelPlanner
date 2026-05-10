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
       LAUNCH CHROMIUM
    ======================================== */

    const browser =
      await puppeteer.launch({

        args: chromium.args,

        executablePath:
          await chromium.executablePath(),

        headless: chromium.headless,

        defaultViewport: {

          width: 1440,

          height: 2200,

          deviceScaleFactor: 2,
        },
      });

    const page =
      await browser.newPage();

    /* ========================================
       OPEN PRINT PAGE
    ======================================== */

    const printUrl =
      `${baseUrl}/print/${id}?export=true`;

    console.log(
      "OPENING:",
      printUrl
    );

    await page.goto(
      printUrl,
      {

        waitUntil:
          "networkidle0",

        timeout: 60000,
      }
    );

    /* ========================================
       WAIT FOR FULL RENDER
    ======================================== */

    await page.waitForSelector(
      "body",
      {
        timeout: 15000,
      }
    );

    /* ========================================
       EXTRA WAIT FOR FIRESTORE
    ======================================== */

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          2500
        )
    );

    /* ========================================
       SCREEN MODE
    ======================================== */

    await page.emulateMediaType(
      "screen"
    );

    /* ========================================
       PDF GENERATION
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