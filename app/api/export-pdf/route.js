import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const dynamic =
  "force-dynamic";

export const maxDuration = 60;

export async function POST(req) {

  try {

    const body =
      await req.json();

    const html =
      body.html;

    if (!html) {

      return Response.json(
        {
          error: "Missing HTML",
        },
        {
          status: 400,
        }
      );
    }

    const browser =
      await puppeteer.launch({

        args: chromium.args,

        executablePath:
          await chromium.executablePath(),

        headless: true,

        defaultViewport: {

          width: 1440,

          height: 2200,

          deviceScaleFactor: 2,
        },
      });

    const page =
      await browser.newPage();

    await page.setViewport({

      width: 1440,

      height: 2200,

      deviceScaleFactor: 2,
    });

    await page.setContent(
      html,
      {
        waitUntil:
          "networkidle0",
      }
    );

    await page.emulateMediaType(
      "screen"
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