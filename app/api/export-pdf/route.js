import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export const maxDuration =
  60;

export async function POST(req) {

  let browser;

  try {

    const body =
      await req.json();

    const html =
      body?.html;

    if (!html) {

      return Response.json(
        {
          error:
            "Missing HTML content",
        },
        {
          status: 400,
        }
      );
    }

    browser =
      await puppeteer.launch({

        args: [
          ...chromium.args,
          "--hide-scrollbars",
          "--disable-web-security",
          "--no-sandbox",
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

    await page.setContent(
      html,
      {
        waitUntil:
          "networkidle0",
      }
    );

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