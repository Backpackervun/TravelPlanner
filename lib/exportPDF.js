import html2pdf from "html2pdf.js";

export async function exportTravelPDF() {

  const element = document.getElementById("pdf-content");

  if (!element) {
    console.error("PDF content not found");
    return;
  }

  const options = {

    margin: [8, 8, 8, 8],

    filename: "Backpackervun-Itinerary.pdf",

    image: {
      type: "jpeg",
      quality: 1
    },

    html2canvas: {

      scale: 2,

      useCORS: true,

      scrollX: 0,
      scrollY: 0
    },

    jsPDF: {

      unit: "mm",

      format: "a4",

      orientation: "portrait"
    },

    pagebreak: {

      mode: ["css", "legacy"]

    }

  };

  await html2pdf()
    .set(options)
    .from(element)
    .save();
}