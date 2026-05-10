import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const dynamic = "force-dynamic";

export async function GET(req) {

  try {

    console.log("PDF START");

    const { searchParams } =
      new URL(req.url);

    const id =
      searchParams.get("id");

    console.log("PDF ID:", id);

    const baseUrl =
      process.env
        .NEXT_PUBLIC_SITE_URL;

    console.log(
      "BASE URL:",
      baseUrl
    );

    const browser =
      await puppeteer.launch({

        args: chromium.args,

        defaultViewport:
          chromium.defaultViewport,

        executablePath:
          await chromium.executablePath(),

        headless: true,

      });

    console.log(
      "BROWSER READY"
    );

    const page =
      await browser.newPage();

    await page.goto(
      `${baseUrl}/print/${id}?export=true`,
      {
        waitUntil:
          "domcontentloaded",
      }
    );

    console.log(
      "PAGE LOADED"
    );

    await page.waitForSelector(
      ".preview-paper",
      {
        timeout: 5000,
      }
    );

    console.log(
      "SELECTOR READY"
    );

    await page.emulateMediaType(
      "screen"
    );

    const pdf =
      await page.pdf({

        format: "A4",

        printBackground: true,

        preferCSSPageSize: true,

        scale: 0.98,

        margin: {
          top: "0px",
          right: "0px",
          bottom: "0px",
          left: "0px",
        },

      });

    console.log(
      "PDF GENERATED"
    );

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