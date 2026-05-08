"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useT } from "@/context/TranslationContext";
import { getCurrency, CATEGORY_OPTIONS } from "@/lib/utils";
import { getTransportOptions } from "@/lib/regions";

export default function ItineraryTable({
  rows = [],
  dayMap = {},
  region,
  onUpdate,
  onAdd,
  onDelete,
  onInsertAbove,
  onInsertBelow,
}) {

  const { t } = useT();

  const currency = getCurrency(region);
  const isIDR = currency.code === "IDR";

  const transportOptions = getTransportOptions(region);

  return (
    <div className="rounded-2xl border border-paper-line bg-white shadow-soft overflow-hidden">

      {/* HEADER */}
      <div className="px-5 py-4 border-b border-paper-line flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-navy-400">
            02 — ITINERARY PLANNER
          </p>

          <h2 className="text-2xl font-semibold text-ink mt-1">
            {t("dayByDay")}
          </h2>
        </div>

        <span className="rounded-full border border-paper-line bg-paper-dim px-3 py-1 text-xs text-ink-muted">
          {rows.length} stops
        </span>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">

        <table className="w-full min-w-[1200px] text-sm">

          <thead>
            <tr className="border-b border-paper-line bg-paper-dim/60">

              {[
                "DATE",
                "TIME",
                "CITY",
                "DESTINATION",
                "FROM / TO",
                "TRANSPORT",
                "CATEGORY",
                "NOTES",
                currency.code,
                !isIDR ? "IDR" : null,
                "LINKS",
                ""
              ]
                .filter(Boolean)
                .map((h, i) => (
                  <th
                    key={i}
                    className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}

            </tr>
          </thead>

          <tbody>

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={isIDR ? 10 : 11}
                  className="px-6 py-20 text-center text-ink-muted"
                >
                  No stops yet. Click + Add row to start planning.
                </td>
              </tr>
            )}

            {rows.map((row, index) => (

              <tr
                key={row.id}
                className="border-b border-paper-line hover:bg-paper-dim/20"
              >

                {/* DATE */}
                <td className="px-3 py-3">
                  <input
                    type="date"
                    value={row.date || ""}
                    onChange={(e) =>
                      onUpdate(row.id, "date", e.target.value)
                    }
                    className="cell-input"
                  />
                </td>

                {/* TIME */}
                <td className="px-3 py-3">
                  <input
                    type="time"
                    value={row.time || ""}
                    onChange={(e) =>
                      onUpdate(row.id, "time", e.target.value)
                    }
                    className="cell-input"
                  />
                </td>

                {/* CITY */}
                <td className="px-3 py-3">
                  <input
                    value={row.city || ""}
                    onChange={(e) =>
                      onUpdate(row.id, "city", e.target.value)
                    }
                    className="cell-input"
                  />
                </td>

                {/* DESTINATION */}
                <td className="px-3 py-3">
                  <input
                    value={row.destination || ""}
                    onChange={(e) =>
                      onUpdate(row.id, "destination", e.target.value)
                    }
                    className="cell-input"
                  />
                </td>

                {/* FROM TO */}
                <td className="px-3 py-3">
                  <input
                    value={`${row.from || ""} / ${row.to || ""}`}
                    onChange={(e) => {
                      const val = e.target.value.split("/");
                      onUpdate(row.id, "from", val[0] || "");
                      onUpdate(row.id, "to", val[1] || "");
                    }}
                    className="cell-input"
                  />
                </td>

                {/* TRANSPORT */}
                <td className="px-3 py-3">
                  <select
                    value={row.transport || ""}
                    onChange={(e) =>
                      onUpdate(row.id, "transport", e.target.value)
                    }
                    className="cell-input"
                  >
                    <option value="">Select</option>

                    {transportOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}

                  </select>
                </td>

                {/* CATEGORY */}
                <td className="px-3 py-3">
                  <select
                    value={row.category || ""}
                    onChange={(e) =>
                      onUpdate(row.id, "category", e.target.value)
                    }
                    className="cell-input"
                  >
                    <option value="">Select</option>

                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}

                  </select>
                </td>

                {/* NOTES */}
                <td className="px-3 py-3">
                  <input
                    value={row.notes || ""}
                    onChange={(e) =>
                      onUpdate(row.id, "notes", e.target.value)
                    }
                    className="cell-input"
                  />
                </td>

                {/* LOCAL */}
                <td className="px-3 py-3">
                  <input
                    type="number"
                    value={row.budgetLocal || 0}
                    onChange={(e) =>
                      onUpdate(
                        row.id,
                        "budgetLocal",
                        Number(e.target.value)
                      )
                    }
                    className="cell-input text-right"
                  />
                </td>

                {/* IDR */}
                {!isIDR && (
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      value={row.budgetIDR || 0}
                      readOnly
                      className="cell-input text-right bg-paper-dim"
                    />
                  </td>
                )}

                {/* LINKS */}
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-2">

                    <button className="rounded-full border border-paper-line px-3 py-1 text-xs">
                      📍 Map
                    </button>

                    <button className="rounded-full border border-paper-line px-3 py-1 text-xs">
                      🗺️ Route
                    </button>

                    <button className="rounded-full border border-paper-line px-3 py-1 text-xs">
                      ✈️ Flights
                    </button>

                  </div>
                </td>

                {/* ACTIONS */}
                <td className="px-3 py-3 text-right">

                  <RowActions
                    onInsertAbove={() => onInsertAbove(row.id)}
                    onInsertBelow={() => onInsertBelow(row.id)}
                    onDelete={() => onDelete(row.id)}
                  />

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* FOOTER */}
      <div className="border-t border-paper-line p-4">

        <button
          onClick={onAdd}
          className="rounded-xl border border-dashed border-paper-line px-4 py-2 text-sm font-medium text-ink-muted hover:bg-paper-dim"
        >
          ＋ Add row
        </button>

      </div>

    </div>
  );
}

/* ======================================================
ROW ACTIONS
====================================================== */

function RowActions({
  onInsertAbove,
  onInsertBelow,
  onDelete,
}) {

  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">

      <button
        onClick={() => setOpen((v) => !v)}
        className="grid h-8 w-8 place-items-center rounded-lg hover:bg-paper-dim"
      >
        ⋮
      </button>

      {open &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setOpen(false)}
            />

            <div
              className="fixed right-6 mt-2 w-44 rounded-2xl border border-paper-line bg-white p-1 shadow-2xl z-[9999]"
              style={{
                top: "180px",
              }}
            >

              <button
                onClick={() => {
                  onInsertAbove();
                  setOpen(false);
                }}
                className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-paper-dim"
              >
                ↑ Insert Above
              </button>

              <button
                onClick={() => {
                  onInsertBelow();
                  setOpen(false);
                }}
                className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-paper-dim"
              >
                ↓ Insert Below
              </button>

              <button
                onClick={() => {
                  onDelete();
                  setOpen(false);
                }}
                className="w-full rounded-xl px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50"
              >
                🗑 Delete Row
              </button>

            </div>
          </>,
          document.body
        )}

    </div>
  );
}