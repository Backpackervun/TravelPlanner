import puppeteer
  from "puppeteer-core";

import chromium
  from "@sparticuz/chromium";

export const dynamic =
  "force-dynamic";

export async function GET(req) {

  try {

    const { searchParams } =
      new URL(req.url);

    const url =
      searchParams.get("url");

    if (!url) {

      return new Response(
        JSON.stringify({
          error: "Missing URL",
        }),
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
      });

    const page =
      await browser.newPage();

    await page.goto(
      url,
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

    console.error(err);

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