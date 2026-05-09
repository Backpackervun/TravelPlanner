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
    padding: 32,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },

  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
  },

  card: {
    border: "1 solid #E2E8F0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },

  rowTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
  },

  small: {
    fontSize: 10,
    color: "#64748B",
    marginBottom: 2,
  },

  links: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    flexWrap: "wrap",
  },

  link: {
    color: "#2563EB",
    fontSize: 10,
    textDecoration: "none",
  },

  budget: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: 700,
  },

  footer: {
    marginTop: 24,
    paddingTop: 12,
    borderTop: "1 solid #E2E8F0",
    fontSize: 9,
    textAlign: "center",
    color: "#64748B",
  },
});

export default function TravelPdfDocument({
  tripInfo = {},
  rows = [],
  currency = { symbol: "¥" },
  totals = {},
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        <View style={styles.header}>
          <Text style={styles.title}>
            TRAVEL PLANNER
          </Text>

          <Text>
            Prepared For: {tripInfo?.clientName || "Client"}
          </Text>

          <Text>
            Destination: {tripInfo?.destinations || "-"}
          </Text>

          <Text>
            Duration: {tripInfo?.duration || "-"}
          </Text>
        </View>

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

              <Text style={styles.rowTitle}>
                {row.destination || "Untitled Stop"}
              </Text>

              <Text style={styles.small}>
                {row.from || "-"} → {row.to || "-"}
              </Text>

              <Text style={styles.small}>
                {row.transport || "-"}
              </Text>

              {row.notes ? (
                <Text style={styles.small}>
                  {row.notes}
                </Text>
              ) : null}

              <View style={styles.links}>

                {mapUrl && (
                  <Link src={mapUrl} style={styles.link}>
                    📍 Map
                  </Link>
                )}

                {routeUrl && (
                  <Link src={routeUrl} style={styles.link}>
                    🗺 Route
                  </Link>
                )}

                {bookingUrl && (
                  <Link src={bookingUrl} style={styles.link}>
                    ✈ Booking
                  </Link>
                )}

              </View>

              <Text style={styles.budget}>
                {currency?.symbol || "¥"}
                {Number(row.budgetLocal || 0).toLocaleString()}
              </Text>

            </View>
          );
        })}

        <View style={{ marginTop: 24 }}>
          <Text>
            TOTAL: {currency?.symbol || "¥"}
            {Number(totals?.local || 0).toLocaleString()}
          </Text>
        </View>

        <Text style={styles.footer}>
          PREPARED WITH BACKPACKERVUN · BACKPACKERVUN.COM
        </Text>

      </Page>
    </Document>
  );
}