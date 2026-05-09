import puppeteer from "puppeteer";

export const dynamic = "force-dynamic";

export async function GET() {

  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  await page.goto(
    `${baseUrl}/print/demo`,
    {
      waitUntil: "networkidle0",
    }
  );

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
      "Content-Type": "application/pdf",
    },
  });
}