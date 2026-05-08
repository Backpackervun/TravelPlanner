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
    <div className="print-doc">

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
                <div className="flex items-center gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B3C5D] text-sm font-bold text-white">
                    {dayNumber || "—"}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      DAY {dayNumber || "—"}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {date !== "__nodate__" ? date : "No Date"}
                    </p>
                  </div>

                </div>

                {/* ROWS */}
                <div className="divide-y divide-slate-100">

                  {items.map((row) => {

                    const mapUrl = buildMapUrl(
                      row.destination
                    );

                    const routeUrl =
                      row.from && row.to
                        ? buildRouteUrl(
                            row.from,
                            row.to
                          )
                        : null;

                    const bookingLink =
                      getBookingLink(
                        row,
                        region
                      );

                    return (
                      <div
                        key={row.id}
                        className="grid grid-cols-[80px_1fr_140px] gap-5 px-5 py-5"
                      >

                        {/* TIME */}
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {row.time || "—"}
                          </p>
                        </div>

                        {/* CONTENT */}
                        <div>

                          <h4 className="text-base font-bold text-slate-900">
                            {row.destination || "Untitled Stop"}
                          </h4>

                          {(row.from || row.to) && (
                            <p className="mt-1 text-sm text-slate-500">
                              {row.from || "—"} → {row.to || "—"}
                            </p>
                          )}

                          {row.transport && (
                            <p className="mt-1 text-sm text-slate-500">
                              {transportIcon(row.transport)}{" "}
                              {row.transport}
                            </p>
                          )}

                          {row.notes && (
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                              {row.notes}
                            </p>
                          )}

                          {/* LINKS */}
                          <div className="mt-3 flex flex-wrap gap-2">

                            {mapUrl && (
                              <a
                                href={mapUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
                              >
                                📍 Map
                              </a>
                            )}

                            {routeUrl && (
                              <a
                                href={routeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
                              >
                                🗺 Route
                              </a>
                            )}

                            {bookingLink && (
                              <a
                                href={bookingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
                              >
                                ✈ Booking
                              </a>
                            )}

                          </div>
                        </div>

                        {/* BUDGET */}
                        <div className="text-right">

                          <p className="text-sm font-bold text-slate-900">
                            {formatCurrency(
                              Number(row.budgetLocal) || 0,
                              currency.code
                            )}
                          </p>

                          {!isIDR && (
                            <p className="mt-1 text-xs text-slate-500">
                              {formatIDR(
                                Number(row.budgetIDR) || 0
                              )}
                            </p>
                          )}

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

      {/* =========================
          SUMMARY
      ========================== */}

      <section className="px-8 pb-10">

        <div className="rounded-2xl border border-slate-200">

          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-900">
              Trip Summary
            </h2>
          </div>

          <div className="divide-y divide-slate-100">

            <SummaryRow
              label="Total Stops"
              value={meaningfulRows.length}
            />

            <SummaryRow
              label={`Total (${currency.code})`}
              value={formatCurrency(
                totalLocal,
                currency.code
              )}
            />

            {!isIDR && (
              <>
                <SummaryRow
                  label="Total (IDR)"
                  value={formatIDR(totalIDR)}
                />

                <SummaryRow
                  label="Exchange Rate"
                  value={`1 ${currency.code} = ${rate} IDR`}
                />
              </>
            )}

          </div>
        </div>

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.18em] text-slate-400">
          PREPARED WITH BACKPACKERVUN · BACKPACKERVUN.COM
        </p>

      </section>
    </div>
  );
}

/* ========================================= */

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-900">
        {value}
      </p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-sm font-bold text-slate-900">
        {value}
      </span>
    </div>
  );
}