import puppeteer from "puppeteer-core";

import chromium from "@sparticuz/chromium";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export const maxDuration =
  60;

export async function GET(req) {

  let browser;

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
        "NEXT_PUBLIC_SITE_URL missing"
      );
    }

    /* ========================================
       IMPORTANT FIX
    ======================================== */

    browser =
      await puppeteer.launch({

        args: [
          ...chromium.args,
          "--hide-scrollbars",
          "--disable-web-security",
        ],

        defaultViewport: {
          width: 1440,
          height: 2200,
        },

        executablePath:
          await chromium.executablePath(),

        headless: chromium.headless,

        ignoreHTTPSErrors: true,
      });

    const page =
      await browser.newPage();

    await page.goto(

      `${baseUrl}/print/${id}`,

      {

        waitUntil:
          "domcontentloaded",

        timeout: 60000,
      }
    );

    /* ========================================
       WAIT FULL RENDER
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
          3000
        )
    );

    /* ========================================
       PDF
    ======================================== */

    const pdf =
      await page.pdf({

        format: "A4",

        printBackground: true,

        preferCSSPageSize: true,

        margin: {

          top: "0mm",
          right: "0mm",
          bottom: "0mm",
          left: "0mm",
        },
      });

    await browser.close();

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
      "PDF EXPORT ERROR:",
      err
    );

    if (browser) {

      await browser.close();
    }

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