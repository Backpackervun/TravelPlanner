"use client";

import {
  buildMapUrl,
  buildRouteUrl,
  CATEGORY_ICONS,
  CATEGORY_OPTIONS,
  CATEGORY_STYLES,
  formatCurrency,
  formatIDR,
  getCurrency,
  getRegion,
  getBookingLink,
  transportIcon,
} from "@/lib/utils";
import { formatDayLabel, formatTimeLabel, groupByDay } from "@/lib/itinerary";

/**
 * PrintLayout — the dedicated print/preview document.
 *
 * Renders a vertical, A4-friendly itinerary:
 *   1. "Prepared for client" panel
 *   2. Day-by-day blocks with stops
 *   3. Trip summary (totals + category breakdown)
 *
 * Used both by the on-screen Preview mode (parent toggles .preview-mode)
 * and by the actual @media print export. No tables, no inputs, no charts.
 */
export default function PrintLayout({
  tripInfo,
  rows,
  dayMap,
  region,
  rate,
  totalLocal,
  totalIDR,
}) {
  const days = groupByDay(rows, dayMap);
  const categoryTotals = computeCategoryTotals(rows);
  const stopsCount = rows.length;
  const regionMeta = getRegion(region);
  const currency = getCurrency(region);
  const showIDR = currency.code !== "IDR";

  return (
    <div className="print-doc">
      {/* ───────── Prepared for client ───────── */}
      <section className="pd-section pd-prepared">
        <p className="pd-eyebrow">Prepared for client</p>
        <h2 className="pd-client-name">{tripInfo.clientName || "—"}</h2>
        <dl className="pd-client-meta">
          <Meta label="Duration" value={tripInfo.duration} />
          <Meta label="Destinations" value={tripInfo.destinations} />
          <Meta label="Travel Dates" value={tripInfo.travelDates} />
          {regionMeta && (
            <Meta
              label="Region"
              value={`${regionMeta.flag}  ${regionMeta.id}`}
            />
          )}
        </dl>
      </section>

      <h2 className="pd-h2">Itinerary</h2>

      {days.length === 0 ? (
        <p className="pd-empty">No itinerary entries yet.</p>
      ) : (
        days.map((group, idx) => (
          <DayBlock
            key={`${group.day}-${group.date}-${idx}`}
            group={group}
            region={region}
            currency={currency}
            showIDR={showIDR}
          />
        ))
      )}

      {/* ───────── Summary ───────── */}
      <section className="pd-section pd-summary">
        <h2 className="pd-h2">Trip Summary</h2>

        <div className="pd-summary-totals">
          <div className="pd-summary-row">
            <span className="pd-summary-label">Total stops</span>
            <span className="pd-summary-value">{stopsCount}</span>
          </div>
          <div className="pd-summary-row">
            <span className="pd-summary-label">Total days</span>
            <span className="pd-summary-value">{days.length}</span>
          </div>
          {showIDR && (
            <div className="pd-summary-row">
              <span className="pd-summary-label">Conversion rate</span>
              <span className="pd-summary-value">1 {currency.code} = {rate} IDR</span>
            </div>
          )}
          <div className="pd-summary-row pd-summary-row-strong">
            <span className="pd-summary-label">Total · {currency.code}</span>
            <span className="pd-summary-value">{formatCurrency(totalLocal, currency)}</span>
          </div>
          {showIDR && (
            <div className="pd-summary-row pd-summary-row-strong pd-summary-row-accent">
              <span className="pd-summary-label">Total · IDR</span>
              <span className="pd-summary-value">{formatIDR(totalIDR)}</span>
            </div>
          )}
        </div>

        {categoryTotals.some((c) => c.local > 0) && (
          <div className="pd-category-block">
            <h3 className="pd-h3">By category</h3>
            <ul className="pd-category-list">
              {categoryTotals
                .filter((c) => c.local > 0)
                .map((c) => {
                  const pct = totalLocal > 0 ? (c.local / totalLocal) * 100 : 0;
                  return (
                    <li key={c.name} className="pd-category-row">
                      <span
                        className="pd-category-swatch"
                        style={{ background: c.color }}
                      />
                      <span className="pd-category-name">
                        {CATEGORY_ICONS[c.name] ?? ""} {c.name}
                      </span>
                      <span className="pd-category-bar-track">
                        <span
                          className="pd-category-bar-fill"
                          style={{ width: `${pct}%`, background: c.color }}
                        />
                      </span>
                      <span className="pd-category-pct">{pct.toFixed(0)}%</span>
                      <span className="pd-category-amount">
                        {formatCurrency(c.local, currency)}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </div>
        )}
      </section>

      <footer className="pd-footer">
        Prepared with Backpackervun · backpackervun.com
      </footer>
    </div>
  );
}

// ============================================================
// Day block
// ============================================================
function DayBlock({ group, region, currency, showIDR }) {
  const dayLabel = group.day ? `Day ${group.day}` : "Day —";
  const dateLabel = formatDayLabel(group.date);

  return (
    <section className="day-block">
      <header className="day-block-header">
        <div className="day-block-marker">{group.day ?? "—"}</div>
        <div className="day-block-heading">
          <h3 className="day-block-title">
            {dayLabel}
            {group.city ? ` — ${group.city}` : ""}
          </h3>
          <p className="day-block-meta">{dateLabel}</p>
        </div>
      </header>

      <ol className="stop-list">
        {group.items.map((row) => (
          <Stop
            key={row.id}
            row={row}
            region={region}
            currency={currency}
            showIDR={showIDR}
          />
        ))}
      </ol>
    </section>
  );
}

// ============================================================
// One stop — no estimates, just facts the user typed
// ============================================================
function Stop({ row, region, currency, showIDR }) {
  const time = formatTimeLabel(row.time);
  const cat = row.category;
  const catStyle = CATEGORY_STYLES[cat];
  const catIcon = CATEGORY_ICONS[cat];
  const transport = row.transport;
  const showRoute = row.from && row.to;

  const mapUrl = buildMapUrl(row.destination);
  const routeUrl = showRoute ? buildRouteUrl(row.from, row.to) : null;
  const bookingLink = getBookingLink(row, region);

  const local = Number(row.budgetLocal) || 0;
  const idr = Number(row.budgetIDR) || 0;

  return (
    <li className="stop">
      <div className="stop-rail">
        <span className="stop-time">{time || "—"}</span>
        <span className="stop-dot" aria-hidden="true" />
      </div>

      <div className="stop-body">
        <div className="stop-headline">
          {cat && catStyle && (
            <span
              className="stop-cat"
              style={{ color: catStyle.bar, borderColor: catStyle.bar }}
            >
              {catIcon ? `${catIcon} ` : ""}{cat}
            </span>
          )}
          <h4 className="stop-title">{row.destination || "Untitled stop"}</h4>
        </div>

        {/* Transport / route — icon + type + from → to */}
        {(transport || showRoute) && (
          <p className="stop-route">
            {transport && (
              <>
                <span className="stop-transport-icon" aria-hidden="true">
                  {transportIcon(transport)}
                </span>
                <span className="stop-transport">{transport}</span>
              </>
            )}
            {transport && showRoute && <span className="stop-sep">·</span>}
            {showRoute && (
              <span className="stop-from-to">
                <span>{row.from}</span>
                <span className="stop-arrow">→</span>
                <span>{row.to}</span>
              </span>
            )}
          </p>
        )}

        {row.notes && <p className="stop-notes">{row.notes}</p>}

        {/* Maps + booking — text-style chips, clickable in the PDF */}
        {(mapUrl || routeUrl || bookingLink) && (
          <p className="stop-links">
            {mapUrl && (
              <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                📍 View in Google Maps
              </a>
            )}
            {routeUrl && (
              <a href={routeUrl} target="_blank" rel="noopener noreferrer">
                🗺 Open Route
              </a>
            )}
            {bookingLink && (
              <a
                href={bookingLink.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {bookingLink.label}
              </a>
            )}
          </p>
        )}
      </div>

      <div className="stop-budget">
        {local > 0 ? (
          <>
            <span className="stop-budget-local">
              {formatCurrency(local, currency)}
            </span>
            {showIDR && (
              <span className="stop-budget-idr">{formatIDR(idr)}</span>
            )}
          </>
        ) : (
          <span className="stop-budget-free">—</span>
        )}
      </div>
    </li>
  );
}

// ============================================================
// Helpers
// ============================================================
function Meta({ label, value }) {
  return (
    <div className="pd-meta-row">
      <dt>{label}</dt>
      <dd>{value || "—"}</dd>
    </div>
  );
}

function computeCategoryTotals(rows) {
  return CATEGORY_OPTIONS.map((name) => {
    const local = rows
      .filter((r) => r.category === name)
      .reduce((sum, r) => sum + (Number(r.budgetLocal) || 0), 0);
    return {
      name,
      local,
      color: CATEGORY_STYLES[name].bar,
    };
  });
}
