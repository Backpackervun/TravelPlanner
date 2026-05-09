"use client";

import React from "react";

import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 28,
    backgroundColor: "#F8FAFC",
    fontFamily: "Helvetica",
    color: "#0F172A",
    fontSize: 11,
  },

  // ───────────────── HEADER ─────────────────

  header: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    marginBottom: 22,
    border: "1 solid #E2E8F0",
  },

  eyebrow: {
    fontSize: 9,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  title: {
    fontSize: 26,
    fontWeight: 700,
    marginBottom: 16,
    color: "#0F172A",
  },

  metaRow: {
    flexDirection: "row",
    marginBottom: 6,
  },

  metaLabel: {
    width: 90,
    fontSize: 10,
    color: "#64748B",
  },

  metaValue: {
    fontSize: 10,
    fontWeight: 600,
    color: "#0F172A",
  },

  // ───────────────── DAY SECTION ─────────────────

  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0F172A",
    marginBottom: 16,
  },

  // ───────────────── STOP CARD ─────────────────

  card: {
    backgroundColor: "#FFFFFF",
    border: "1 solid #E2E8F0",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  cardLeft: {
    flex: 1,
    paddingRight: 12,
  },

  cardRight: {
    alignItems: "flex-end",
  },

  destination: {
    fontSize: 17,
    fontWeight: 700,
    marginBottom: 6,
    color: "#0F172A",
  },

  route: {
    fontSize: 10,
    color: "#64748B",
    marginBottom: 4,
  },

  transport: {
    fontSize: 10,
    color: "#334155",
    marginBottom: 4,
  },

  notes: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 6,
    lineHeight: 1.4,
  },

  // ───────────────── BUDGET ─────────────────

  budgetPill: {
    backgroundColor: "#EFF6FF",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  budgetText: {
    fontSize: 11,
    fontWeight: 700,
    color: "#2563EB",
  },

  // ───────────────── LINKS ─────────────────

  linksWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },

  linkPill: {
    border: "1 solid #CBD5E1",
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    textDecoration: "none",
  },

  linkText: {
    fontSize: 9,
    color: "#0F172A",
    fontWeight: 600,
  },

  // ───────────────── SUMMARY ─────────────────

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    border: "1 solid #E2E8F0",
    padding: 18,
    marginTop: 12,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottom: "1 solid #E2E8F0",
  },

  summaryLabel: {
    fontSize: 10,
    color: "#64748B",
  },

  summaryValue: {
    fontSize: 10,
    fontWeight: 700,
    color: "#0F172A",
  },

  summaryStrong: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0F172A",
  },

  // ───────────────── FOOTER ─────────────────

  footer: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 8,
    color: "#94A3B8",
  },
});

export default function TravelPdfDocument({
  tripInfo = {},
  rows = [],
  currency = {
    code: "JPY",
    symbol: "¥",
    locale: "ja-JP",
  },
  totals = {},
}) {
  const safeCurrency = currency || {
    code: "JPY",
    symbol: "¥",
    locale: "ja-JP",
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ───────────────── HEADER ───────────────── */}

        <View style={styles.header}>

          <Text style={styles.eyebrow}>
            BACKPACKERVUN TRAVEL PLANNER
          </Text>

          <Text style={styles.title}>
            Travel Itinerary
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Prepared For</Text>
            <Text style={styles.metaValue}>
              {tripInfo?.clientName || "Client"}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Destination</Text>
            <Text style={styles.metaValue}>
              {tripInfo?.destinations || "-"}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Duration</Text>
            <Text style={styles.metaValue}>
              {tripInfo?.duration || "-"}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Travel Dates</Text>
            <Text style={styles.metaValue}>
              {tripInfo?.travelDates || "-"}
            </Text>
          </View>

        </View>

        {/* ───────────────── ITINERARY ───────────────── */}

        <Text style={styles.sectionTitle}>
          Itinerary
        </Text>

        {rows.map((row, index) => {

          const mapUrl = row.destination
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(row.destination)}`
            : null;

          const routeUrl =
            row.from && row.to
              ? `https://www.google.com/maps/dir/${encodeURIComponent(row.from)}/${encodeURIComponent(row.to)}`
              : null;

          const bookingUrl =
            row.destination
              ? `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(row.destination)}`
              : null;

          return (
            <View key={index} style={styles.card} wrap={false}>

              <View style={styles.cardTop}>

                <View style={styles.cardLeft}>

                  <Text style={styles.destination}>
                    {row.destination || "Untitled Stop"}
                  </Text>

                  <Text style={styles.route}>
                    {row.from || "-"} → {row.to || "-"}
                  </Text>

                  <Text style={styles.transport}>
                    {row.transport || "-"}
                  </Text>

                  {row.notes ? (
                    <Text style={styles.notes}>
                      {row.notes}
                    </Text>
                  ) : null}

                </View>

                <View style={styles.cardRight}>

                  <View style={styles.budgetPill}>
                    <Text style={styles.budgetText}>
                      {new Intl.NumberFormat(
                        safeCurrency.locale,
                        {
                          style: "currency",
                          currency: safeCurrency.code,
                          maximumFractionDigits:
                            ["IDR", "VND", "KRW"].includes(safeCurrency.code)
                              ? 0
                              : 2,
                        }
                      ).format(Number(row.budgetLocal || 0))}
                    </Text>
                  </View>

                </View>

              </View>

              <View style={styles.linksWrap}>

                {mapUrl && (
                  <Link src={mapUrl} style={styles.linkPill}>
                    <Text style={styles.linkText}>
                      📍 Map
                    </Text>
                  </Link>
                )}

                {routeUrl && (
                  <Link src={routeUrl} style={styles.linkPill}>
                    <Text style={styles.linkText}>
                      🗺 Route
                    </Text>
                  </Link>
                )}

                {bookingUrl && (
                  <Link src={bookingUrl} style={styles.linkPill}>
                    <Text style={styles.linkText}>
                      ✈ Booking
                    </Text>
                  </Link>
                )}

              </View>

            </View>
          );
        })}

        {/* ───────────────── SUMMARY ───────────────── */}

        <View style={styles.summaryCard}>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Total Stops
            </Text>

            <Text style={styles.summaryValue}>
              {rows.length}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Total Budget
            </Text>

            <Text style={styles.summaryStrong}>
              {new Intl.NumberFormat(
                safeCurrency.locale,
                {
                  style: "currency",
                  currency: safeCurrency.code,
                  maximumFractionDigits:
                    ["IDR", "VND", "KRW"].includes(safeCurrency.code)
                      ? 0
                      : 2,
                }
              ).format(Number(totals?.local || 0))}
            </Text>
          </View>

        </View>

        {/* ───────────────── FOOTER ───────────────── */}

        <Text style={styles.footer}>
          PREPARED WITH BACKPACKERVUN · BACKPACKERVUN.COM
        </Text>

      </Page>
    </Document>
  );
}