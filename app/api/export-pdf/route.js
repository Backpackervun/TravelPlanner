import puppeteer from "puppeteer";

export const dynamic = "force-dynamic";

export async function POST(req) {

  try {

    const { html } = await req.json();

    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    const pdf = await page.pdf({

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

    return new Response(pdf, {

      headers: {
        "Content-Type":
          "application/pdf",

        "Content-Disposition":
          'attachment; filename="backpackervun-itinerary.pdf"',
      },

    });

  } catch (err) {

    console.error(err);

    return new Response(
      "Failed to generate PDF",
      {
        status: 500,
      }
    );
  }
}