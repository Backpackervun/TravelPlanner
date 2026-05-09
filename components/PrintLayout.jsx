"use client";

import { useMemo } from "react";
import { useT } from "@/context/TranslationContext";

import {
  buildMapUrl,
  buildRouteUrl,
  formatCurrency,
  formatIDR,
  getCurrency,
  getBookingLink,
  transportIcon,
} from "@/lib/utils";

function bookingLabel(row) {
  const transport = String(row.transport || "").toLowerCase();
  const category = String(row.category || "").toLowerCase();

  if (transport.includes("flight")) {
    return {
      icon: "✈️",
      label: "Flights",
    };
  }

  if (category.includes("hotel")) {
    return {
      icon: "🏨",
      label: "Hotel",
    };
  }

  return {
    icon: "🎫",
    label: "Book",
  };
}

export default function PrintLayout({
  tripInfo,
  rows,
  dayMap,
  region,
  rate,
  totalLocal,
  totalIDR,
}) {
  const { t } = useT();

  const currency = getCurrency(region);
  const isIDR = currency.code === "IDR";

  const meaningfulRows = rows.filter(
    (r) =>
      r.destination ||
      r.city ||
      r.notes ||
      r.from ||
      r.to ||
      Number(r.budgetLocal) > 0 ||
      Number(r.budgetIDR) > 0
  );

  const grouped = useMemo(() => {
    const map = new Map();

    for (const row of meaningfulRows) {
      const key = row.date || "__nodate__";

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key).push(row);
    }

    return [...map.entries()];
  }, [meaningfulRows]);

  return (
    <div className="print-doc bg-white text-slate-900">

      {/* =========================
          TRIP INFO
      ========================== */}

      <section className="px-8 pt-6 pb-4">

        <div className="rounded-2xl border border-[#E8EDF3] bg-[#F8FAFC] p-5">

          {tripInfo?.clientName && (
            <div className="mb-4">

              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                PREPARED FOR CLIENT
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                {tripInfo.clientName}
              </h1>

            </div>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

            <Info
              label="Duration"
              value={tripInfo?.duration || "—"}
            />

            <Info
              label="Destinations"
              value={tripInfo?.destinations || "—"}
            />

            <Info
              label="Travel Dates"
              value={
                tripInfo?.travelDates ||
                (tripInfo?.startDate && tripInfo?.endDate
                  ? `${tripInfo.startDate} – ${tripInfo.endDate}`
                  : "—")
              }
            />

            <Info
              label="Region"
              value={region || "—"}
            />

          </div>

        </div>

      </section>

      {/* =========================
          ITINERARY
      ========================== */}

      <section className="px-8 pb-8">

        <h2 className="mb-5 text-xl font-bold text-slate-900">
          Itinerary
        </h2>

        {grouped.length === 0 ? (

          <div className="rounded-xl border border-dashed border-slate-300 py-20 text-center text-slate-400">
            No itinerary entries yet.
          </div>

        ) : (

          grouped.map(([date, items], idx) => {

            const dayNumber =
              date !== "__nodate__"
                ? dayMap?.[date]
                : null;

            return (

              <section
                key={date + idx}
                className="mb-8 overflow-hidden rounded-2xl border border-slate-200"
              >

                {/* DAY HEADER */}

                <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0B3B6E] text-sm font-bold text-white">
                      {dayNumber || idx + 1}
                    </div>

                    <div>

                      <h3 className="text-2xl font-bold text-slate-900">
                        DAY {dayNumber || idx + 1}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {date !== "__nodate__" ? date : "No Date"}
                      </p>

                    </div>

                  </div>

                </div>

                {/* ITEMS */}

                <div>

                  {items.map((row, rowIdx) => {

                    const localBudget = Number(row.budgetLocal || 0);
                    const idrBudget = Number(row.budgetIDR || 0);

                    const booking = bookingLabel(row);

                    return (

                      <div
                        key={row.id || rowIdx}
                        className="border-b border-slate-100 px-6 py-6 last:border-b-0"
                      >

                        <div className="flex items-start justify-between gap-6">

                          {/* LEFT */}

                          <div className="flex-1">

                            <div className="flex gap-5">

                              {/* TIME */}

                              <div className="min-w-[64px] text-sm font-semibold text-slate-900">
                                {row.time || "—"}
                              </div>

                              {/* CONTENT */}

                              <div className="flex-1">

                                <h4 className="text-[28px] font-bold leading-tight text-slate-900">
                                  {row.destination || "Untitled Stop"}
                                </h4>

                                {(row.from || row.to) && (
                                  <p className="mt-2 text-base text-slate-500">
                                    {row.from || "—"} → {row.to || "—"}
                                  </p>
                                )}

                                {row.transport && (
                                  <div className="mt-2 text-base text-slate-500">
                                    {transportIcon(row.transport)} {row.transport}
                                  </div>
                                )}

                                {/* ACTION BUTTONS */}

                                <div className="mt-4 flex flex-wrap gap-2">

                                  {row.destination && (
                                    <a
                                      href={buildMapUrl(row.destination)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
                                    >
                                      📍 Map
                                    </a>
                                  )}

                                  {row.from && row.to && (
                                    <a
                                      href={buildRouteUrl(row.from, row.to)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
                                    >
                                      🗺️ Route
                                    </a>
                                  )}

                                  {row.destination && (
                                    <a
                                      href={getBookingLink(row.destination)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
                                    >
                                      {booking.icon} {booking.label}
                                    </a>
                                  )}

                                </div>

                              </div>

                            </div>

                          </div>

                          {/* RIGHT */}

                          <div className="min-w-[180px] text-right">

                            <div className="text-xl font-bold text-slate-900">
                              {formatCurrency(localBudget, currency)}
                            </div>

                            {!isIDR && (
                              <div className="mt-1 text-sm text-slate-500">
                                {formatIDR(idrBudget)}
                              </div>
                            )}

                          </div>

                        </div>

                      </div>

                    );
                  })}

                </div>

              </section>

            );
          })

        )}

      </section>

    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>

      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-900">
        {value}
      </p>

    </div>
  );
}