"use client";

export default function DownloadPDFButton() {

  const handleDownload =
    () => {

      const isMobile =
        /Android|iPhone|iPad|iPod/i.test(
          navigator.userAgent
        );

      // =================================================
      // MOBILE
      // =================================================

      if (isMobile) {

        window.location.href =
          "/api/export-pdf";

        return;
      }

      // =================================================
      // DESKTOP
      // =================================================

      window.open(
        "/api/export-pdf",
        "_blank"
      );
    };

  return (

    <button
      onClick={
        handleDownload
      }
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

    </button>
  );
}