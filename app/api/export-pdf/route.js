import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const dynamic =
  "force-dynamic";

export async function POST(req) {

  try {

    const body =
      await req.json();

    const html =
      body?.html;

    if (!html) {

      return new Response(
        JSON.stringify({
          error:
            "Missing HTML",
        }),
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
          top: "0",
          right: "0",
          bottom: "0",
          left: "0",
        },
      });

    await browser.close();

    return new Response(
      pdf,
      {

        status: 200,

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

    return new Response(
      JSON.stringify({
        error:
          err.message,
      }),
      {
        status: 500,
      }
    );
  }
}