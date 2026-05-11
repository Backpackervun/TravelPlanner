"use client";

export default function DownloadProPDFButton() {

  return (

    <a
      href="/api/export-pro-pdf"
      target="_blank"
      rel="noopener noreferrer"
      className="
        fixed
        bottom-24
        right-6
        z-50
        rounded-2xl
        bg-blue-600
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

      Export Pro PDF

    </a>
  );
}