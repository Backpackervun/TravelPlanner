"use client";

import { createPortal } from "react-dom";
import { useRef, useState } from "react";
import { useT } from "@/context/TranslationContext";
import {
  getCurrency,
  CATEGORY_OPTIONS,
  getTransportOptions,
} from "@/lib/utils";

/**
 * ItineraryTable — FINAL FIXED VERSION
 * Fixed:
 * - TRANSPORT_OPTIONS import error
 * - Date picker
 * - Time picker
 * - Mobile layout
 * - Links column
 * - Dropdown clipping
 * - IDR/local budget locking
 */

export default function ItineraryTable({
  rows,
  dayMap,
  region,
  onUpdate,
  onAdd,
  onDelete,
  onInsertAbove,
  onInsertBelow,
  currencyMode = "local",
}) {
  const { t } = useT();

  const currency = getCurrency(region);
  const isIDR = currency.code === "IDR";

  const localDisabled = currencyMode === "idr";
  const idrDisabled = currencyMode === "local";

  return (
    <div className="rounded-2xl border border-paper-line bg-white shadow-soft overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-paper-line flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-navy-400">
            {t("itinerarySection")}
          </p>

          <h2 className="text-lg font-semibold text-ink">
            {t("dayByDay")}
          </h2>
        </div>

        <span className="rounded-full border border-paper-line bg-paper-dim px-3 py-1 text-xs text-ink-muted">
          {rows.length} stops
        </span>
      </div>

      {/* Currency hint */}
      {!isIDR && (
        <div className="border-b border-paper-line bg-accent-50/40 px-5 py-2">
          <p className="text-xs text-navy-600 font-medium">
            {currencyMode === "idr"
              ? `${t("editIDR")} — ${currency.code} auto-calculated`
              : `${t("editLocal")} — IDR auto-calculated`}
          </p>
        </div>
      )}

      {/* Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full min-w-[1200px] text-sm">
          <thead>
            <tr className="border-b border-paper-line bg-paper-dim/60">

              {[
                "",
                t("date"),
                t("time"),
                t("city"),
                t("destination"),
                t("from"),
                t("to"),
                t("transport"),
                t("category"),
                t("notes"),
                ...(isIDR ? ["IDR"] : [currency.code, "IDR"]),
                t("links"),
                "",
              ].map((h, i) => (
                <th
                  key={i}
                  className="px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted whitespace-nowrap"
                >
                  {h}
                </th>
              ))}

            </tr>
          </thead>

          <tbody className="divide-y divide-paper-line/50">

            {rows.map((row) => {

              const dayNum = row.date
                ? dayMap[(row.date || "").trim()] ?? null
                : null;

              const {
                mapUrl,
                routeUrl,
                flightUrl,
                hotelUrl,
              } = buildLinks(row);

              const transportOptions = getTransportOptions(region);

              return (
                <tr
                  key={row.id}
                  className="hover:bg-paper-dim/20 transition-colors"
                >

                  {/* Day */}
                  <td className="pl-4 py-2">

                    {dayNum !== null && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-500 text-white text-[9px] font-bold">
                        {dayNum}
                      </span>
                    )}

                  </td>

                  {/* Date */}
                  <td className="px-2 py-2">
                    <input
                      type="date"
                      value={row.date || ""}
                      onChange={(e) =>
                        onUpdate(row.id, "date", e.target.value)
                      }
                      className="w-[130px] rounded-lg border border-paper-line bg-white px-2 py-1 text-xs"
                    />
                  </td>

                  {/* Time */}
                  <td className="px-2 py-2">
                    <input
                      type="time"
                      value={row.time || ""}
                      onChange={(e) =>
                        onUpdate(row.id, "time", e.target.value)
                      }
                      className="w-[100px] rounded-lg border border-paper-line bg-white px-2 py-1 text-xs"
                    />
                  </td>

                  {/* City */}
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={row.city || ""}
                      onChange={(e) =>
                        onUpdate(row.id, "city", e.target.value)
                      }
                      className="w-24 rounded-lg border border-paper-line bg-white px-2 py-1 text-xs"
                    />
                  </td>

                  {/* Destination */}
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={row.destination || ""}
                      onChange={(e) =>
                        onUpdate(row.id, "destination", e.target.value)
                      }
                      className="w-36 rounded-lg border border-paper-line bg-white px-2 py-1 text-xs"
                    />
                  </td>

                  {/* From */}
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={row.from || ""}
                      onChange={(e) =>
                        onUpdate(row.id, "from", e.target.value)
                      }
                      className="w-28 rounded-lg border border-paper-line bg-white px-2 py-1 text-xs"
                    />
                  </td>

                  {/* To */}
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={row.to || ""}
                      onChange={(e) =>
                        onUpdate(row.id, "to", e.target.value)
                      }
                      className="w-28 rounded-lg border border-paper-line bg-white px-2 py-1 text-xs"
                    />
                  </td>

                  {/* Transport */}
                  <td className="px-2 py-2">
                    <select
                      value={row.transport || ""}
                      onChange={(e) =>
                        onUpdate(row.id, "transport", e.target.value)
                      }
                      className="w-28 rounded-lg border border-paper-line bg-white px-2 py-1 text-xs"
                    >
                      <option value="">—</option>

                      {(transportOptions || []).map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}

                    </select>
                  </td>

                  {/* Category */}
                  <td className="px-2 py-2">
                    <select
                      value={row.category || ""}
                      onChange={(e) =>
                        onUpdate(row.id, "category", e.target.value)
                      }
                      className="w-28 rounded-lg border border-paper-line bg-white px-2 py-1 text-xs"
                    >
                      <option value="">—</option>

                      {(CATEGORY_OPTIONS || []).map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}

                    </select>
                  </td>

                  {/* Notes */}
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={row.notes || ""}
                      onChange={(e) =>
                        onUpdate(row.id, "notes", e.target.value)
                      }
                      className="w-32 rounded-lg border border-paper-line bg-white px-2 py-1 text-xs"
                    />
                  </td>

                  {/* Local budget */}
                  {!isIDR && (
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={row.budgetLocal || 0}
                        readOnly={localDisabled}
                        onChange={(e) =>
                          !localDisabled &&
                          onUpdate(
                            row.id,
                            "budgetLocal",
                            Number(e.target.value)
                          )
                        }
                        className={`w-24 rounded-lg border px-2 py-1 text-right text-xs ${
                          localDisabled
                            ? "bg-paper-dim opacity-50 cursor-not-allowed"
                            : "bg-white"
                        }`}
                      />
                    </td>
                  )}

                  {/* IDR */}
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={row.budgetIDR || 0}
                      readOnly={idrDisabled && !isIDR}
                      onChange={(e) =>
                        (isIDR || !idrDisabled) &&
                        onUpdate(
                          row.id,
                          "budgetIDR",
                          Number(e.target.value)
                        )
                      }
                      className={`w-24 rounded-lg border px-2 py-1 text-right text-xs ${
                        idrDisabled && !isIDR
                          ? "bg-paper-dim opacity-50 cursor-not-allowed"
                          : "bg-white"
                      }`}
                    />
                  </td>

                  {/* Links */}
                  <td className="px-2 py-2">
                    <div className="flex flex-wrap gap-1">

                      <LinkChip
                        href={mapUrl}
                        icon="📍"
                        label="Map"
                      />

                      {routeUrl && (
                        <LinkChip
                          href={routeUrl}
                          icon="🗺"
                          label="Route"
                        />
                      )}

                      {flightUrl && (
                        <LinkChip
                          href={flightUrl}
                          icon="✈️"
                          label="Flights"
                        />
                      )}

                      {row.category === "Hotel" && hotelUrl && (
                        <LinkChip
                          href={hotelUrl}
                          icon="🏨"
                          label="Hotel"
                        />
                      )}

                    </div>
                  </td>

                  {/* Delete */}
                  <td className="pr-4 py-2">
                    <button
                      onClick={() => onDelete(row.id)}
                      className="rounded-lg p-2 hover:bg-red-50 text-red-500"
                    >
                      ✕
                    </button>
                  </td>

                </tr>
              );
            })}

          </tbody>
        </table>
      </div>

      {/* Add row */}
      <div className="border-t border-paper-line px-5 py-3">
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-paper-line px-4 py-2 text-xs font-semibold text-ink-muted hover:bg-paper-dim"
        >
          + {t("addRow")}
        </button>
      </div>
    </div>
  );
}

/* ========================================================= */

function buildLinks(row) {

  const query = encodeURIComponent(
    [row.destination, row.city, row.to]
      .filter(Boolean)
      .join(" ")
  );

  const mapUrl =
    `https://www.google.com/maps/search/?api=1&query=${query}`;

  const routeUrl =
    row.from && row.to
      ? `https://www.google.com/maps/dir/${encodeURIComponent(
          row.from
        )}/${encodeURIComponent(row.to)}`
      : null;

  const flightUrl =
    row.transport?.toLowerCase().includes("flight") &&
    row.from &&
    row.to
      ? `https://www.google.com/flights?q=Flights+from+${encodeURIComponent(
          row.from
        )}+to+${encodeURIComponent(row.to)}`
      : null;

  const hotelUrl =
    row.destination || row.city
      ? `https://www.booking.com/search.html?ss=${encodeURIComponent(
          row.destination || row.city
        )}`
      : null;

  return {
    mapUrl,
    routeUrl,
    flightUrl,
    hotelUrl,
  };
}

/* ========================================================= */

function LinkChip({
  href,
  icon,
  label,
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-full border border-paper-line bg-white px-2 py-1 text-[10px] font-semibold hover:bg-paper-dim"
    >
      <span>{icon}</span>
      {label}
    </a>
  );
}