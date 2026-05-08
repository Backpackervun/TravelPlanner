import React, { Fragment, useMemo, useRef, useState } from "react";

function RowActions({
  onInsertAbove,
  onInsertBelow,
  onDelete,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex justify-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          grid h-8 w-8 place-items-center
          rounded-lg border border-paper-line
          bg-white hover:bg-paper
          transition
        "
      >
        ⋮
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div
            className="
              absolute right-0 top-10 z-50
              w-44 rounded-xl border border-paper-line
              bg-white p-2 shadow-xl
            "
          >
            <button
              type="button"
              onClick={() => {
                onInsertAbove?.();
                setOpen(false);
              }}
              className="
                flex w-full items-center
                rounded-lg px-3 py-2
                text-left hover:bg-paper
              "
            >
              ↑ Insert Above
            </button>

            <button
              type="button"
              onClick={() => {
                onInsertBelow?.();
                setOpen(false);
              }}
              className="
                flex w-full items-center
                rounded-lg px-3 py-2
                text-left hover:bg-paper
              "
            >
              ↓ Insert Below
            </button>

            <button
              type="button"
              onClick={() => {
                onDelete?.();
                setOpen(false);
              }}
              className="
                flex w-full items-center
                rounded-lg px-3 py-2
                text-left text-red-500
                hover:bg-red-50
              "
            >
              🗑 Delete Row
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function ItineraryTable({
  rows = [],
  setRows,
}) {
  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        city: "",
        destination: "",
        from: "",
        to: "",
        transport: "Flight",
        category: "Transport",
        notes: "",
        jpy: 0,
        idr: 0,
      },
    ]);
  };

  const updateRow = (index, key, value) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              [key]: value,
            }
          : row
      )
    );
  };

  const insertAbove = (index) => {
    const newRow = {
      id: crypto.randomUUID(),
      city: "",
      destination: "",
      from: "",
      to: "",
      transport: "Flight",
      category: "Transport",
      notes: "",
      jpy: 0,
      idr: 0,
    };

    setRows((prev) => [
      ...prev.slice(0, index),
      newRow,
      ...prev.slice(index),
    ]);
  };

  const insertBelow = (index) => {
    const newRow = {
      id: crypto.randomUUID(),
      city: "",
      destination: "",
      from: "",
      to: "",
      transport: "Flight",
      category: "Transport",
      notes: "",
      jpy: 0,
      idr: 0,
    };

    setRows((prev) => [
      ...prev.slice(0, index + 1),
      newRow,
      ...prev.slice(index + 1),
    ]);
  };

  const deleteRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <section
      className="
        overflow-hidden rounded-[32px]
        border border-paper-line
        bg-white shadow-card
      "
    >
      <div className="flex items-center justify-between border-b border-paper-line px-8 py-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand">
            02 — Itinerary Planner
          </p>

          <h2 className="mt-2 text-5xl font-semibold tracking-tight text-ink">
            Day-by-day plan
          </h2>
        </div>

        <div
          className="
            rounded-full border border-paper-line
            bg-paper px-4 py-2
            text-sm text-ink-muted
          "
        >
          {rows.length} stops
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-paper">
            <tr className="text-left text-xs uppercase tracking-[0.24em] text-ink-muted">
              <th className="px-6 py-5">City</th>
              <th className="px-6 py-5">Destination</th>
              <th className="px-6 py-5">From</th>
              <th className="px-6 py-5">To</th>
              <th className="px-6 py-5">Transport</th>
              <th className="px-6 py-5">Category</th>
              <th className="px-6 py-5">Notes</th>
              <th className="px-6 py-5">JPY</th>
              <th className="px-6 py-5">IDR</th>
              <th className="px-6 py-5">Links</th>
              <th className="px-6 py-5"></th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id}
                className="border-t border-paper-line"
              >
                <td className="px-6 py-6">
                  <input
                    value={row.city}
                    onChange={(e) =>
                      updateRow(index, "city", e.target.value)
                    }
                    className="w-full rounded-xl border border-paper-line px-4 py-3"
                  />
                </td>

                <td className="px-6 py-6">
                  <input
                    value={row.destination}
                    onChange={(e) =>
                      updateRow(index, "destination", e.target.value)
                    }
                    className="w-full rounded-xl border border-paper-line px-4 py-3"
                  />
                </td>

                <td className="px-6 py-6">
                  <input
                    value={row.from}
                    onChange={(e) =>
                      updateRow(index, "from", e.target.value)
                    }
                    className="w-full rounded-xl border border-paper-line px-4 py-3"
                  />
                </td>

                <td className="px-6 py-6">
                  <input
                    value={row.to}
                    onChange={(e) =>
                      updateRow(index, "to", e.target.value)
                    }
                    className="w-full rounded-xl border border-paper-line px-4 py-3"
                  />
                </td>

                <td className="px-6 py-6">
                  <select
                    value={row.transport}
                    onChange={(e) =>
                      updateRow(index, "transport", e.target.value)
                    }
                    className="w-full rounded-xl border border-paper-line px-4 py-3"
                  >
                    <option>Flight</option>
                    <option>Train</option>
                    <option>Bus</option>
                    <option>Walk</option>
                  </select>
                </td>

                <td className="px-6 py-6">
                  <select
                    value={row.category}
                    onChange={(e) =>
                      updateRow(index, "category", e.target.value)
                    }
                    className="w-full rounded-xl border border-paper-line px-4 py-3"
                  >
                    <option>Transport</option>
                    <option>Hotel</option>
                    <option>Food</option>
                    <option>Activity</option>
                  </select>
                </td>

                <td className="px-6 py-6">
                  <input
                    value={row.notes}
                    onChange={(e) =>
                      updateRow(index, "notes", e.target.value)
                    }
                    className="w-full rounded-xl border border-paper-line px-4 py-3"
                  />
                </td>

                <td className="px-6 py-6">
                  <input
                    type="number"
                    value={row.jpy}
                    onChange={(e) =>
                      updateRow(index, "jpy", e.target.value)
                    }
                    className="w-28 rounded-xl border border-paper-line px-4 py-3"
                  />
                </td>

                <td className="px-6 py-6">
                  <input
                    type="number"
                    value={row.idr}
                    onChange={(e) =>
                      updateRow(index, "idr", e.target.value)
                    }
                    className="w-32 rounded-xl border border-paper-line px-4 py-3"
                  />
                </td>

                <td className="px-6 py-6">
                  <div className="flex flex-col gap-2">
                    <button className="rounded-full border border-paper-line px-4 py-2">
                      📍 Map
                    </button>

                    <button className="rounded-full border border-paper-line px-4 py-2">
                      🗺 Route
                    </button>

                    <button className="rounded-full border border-paper-line px-4 py-2">
                      ✈ Flights
                    </button>
                  </div>
                </td>

                <td className="px-6 py-6">
                  <RowActions
                    onInsertAbove={() => insertAbove(index)}
                    onInsertBelow={() => insertBelow(index)}
                    onDelete={() => deleteRow(index)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-paper-line p-6">
        <button
          type="button"
          onClick={addRow}
          className="
            rounded-2xl border border-dashed border-paper-line
            px-6 py-4 text-lg font-medium
            text-ink-muted transition
            hover:bg-paper
          "
        >
          ＋ Add row
        </button>
      </div>
    </section>
  );
}