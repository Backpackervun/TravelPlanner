"use client";

export default function DownloadPDFButton() {

  return (

    <a
      href="/api/export-pdf"
      target="_self"
      className="
        fixed
        bottom-6
        right-6
        z-50
        rounded-2xl
        bg-black
        px-6
        py-3
        text-sm
        font-semibold
        text-white
        shadow-xl
        transition
        hover:scale-105
      "
    >

      Download PDF

    </a>
  );
}