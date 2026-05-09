import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#f8fafc",
    paddingBottom: 28,
    color: "#0f172a",
    fontSize: 11,
  },

  /* HERO */
  hero: {
    backgroundColor: "#0f172a",
    paddingTop: 26,
    paddingHorizontal: 28,
    paddingBottom: 24,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },

  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 16,
  },

  heroBadgeText: {
    color: "#cbd5e1",
    fontSize: 8,
    letterSpacing: 1.2,
  },

  heroTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 8,
  },

  heroSubtitle: {
    color: "#cbd5e1",
    fontSize: 11,
    marginBottom: 20,
  },

  heroGrid: {
    flexDirection: "row",
    gap: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
  },

  statLabel: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 6,
  },

  statValue: {
    fontSize: 12,
    fontWeight: 700,
    color: "#0f172a",
  },

  /* BODY */
  body: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 16,
    color: "#0f172a",
  },

  /* DAY CARD */
  dayCard: {
    backgroundColor: "#ffffff",
    border: "1 solid #e2e8f0",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 18,
  },

  dayHeader: {
    backgroundColor: "#f8fafc",
    borderBottom: "1 solid #e2e8f0",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },

  dayBadge: {
    backgroundColor: "#1e293b",
    color: "#ffffff",
    borderRadius: 999,
    fontSize: 9,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },

  dayDate: {
    fontSize: 11,
    color: "#475569",
  },

  /* ITEM */
  item: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottom: "1 solid #f1f5f9",
  },

  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },

  itemLeft: {
    flex: 1,
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 6,
    color: "#0f172a",
  },

  itemRoute: {
    fontSize: 10,
    color: "#64748b",
    lineHeight: 1.5,
    marginBottom: 10,
  },

  transportBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#eef2ff",
    color: "#3730a3",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 8,
    marginBottom: 12,
  },

  budgetWrap: {
    alignItems: "flex-end",
  },

  budgetLabel: {
    fontSize: 8,
    color: "#94a3b8",
    marginBottom: 4,
    textTransform: "uppercase",
  },

  budgetValue: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0f172a",
  },

  /* LINKS */
  linksWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },

  linkPill: {
    border: "1 solid #cbd5e1",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  linkText: {
    fontSize: 9,
    color: "#0f172a",
  },

  /* SUMMARY */
  summaryCard: {
    backgroundColor: "#ffffff",
    border: "1 solid #e2e8f0",
    borderRadius: 16,
    padding: 18,
    marginTop: 10,
  },

  summaryTitle: {
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 16,
  },

  progressRow: {
    marginBottom: 14,
  },

  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  progressLabel: {
    fontSize: 10,
    color: "#475569",
  },

  progressValue: {
    fontSize: 10,
    fontWeight: 700,
  },

  progressTrack: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 999,
    overflow: "hidden",
  },

  progressFill: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#0f172a",
  },

  /* FOOTER */
  footer: {
    marginTop: 24,
    paddingTop: 18,
    borderTop: "1 solid #e2e8f0",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 8,
  },
});

export default function TravelPdfDocument({
  tripInfo,
  rows = [],
  dayMap = {},
  region,
  totalLocal = 0,
  totalIDR = 0,
}) {

  const validRows = rows.filter(
    (row) =>
      row.destination ||
      row.from ||
      row.to
  );

  const grouped = {};

  validRows.forEach((row) => {
    const key = row.date || "No Date";

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(row);
  });

  const totalStops = validRows.length;

  const transportSummary = {};

  validRows.forEach((row) => {
    const type =
      row.transportType || "Other";

    transportSummary[type] =
      (transportSummary[type] || 0) +
      Number(row.budgetLocal || 0);
  });

  const maxTransport = Math.max(
    ...Object.values(transportSummary),
    1
  );

  return (
    <Document>

      <Page size="A4" style={styles.page} wrap>

        {/* HERO */}
        <View style={styles.hero}>

          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>
              BACKPACKERVUN TRAVEL PLANNER
            </Text>
          </View>

          <Text style={styles.heroTitle}>
            Travel Itinerary
          </Text>

          <Text style={styles.heroSubtitle}>
            Prepared for{" "}
            {tripInfo?.clientName || "Guest"}
          </Text>

          <View style={styles.heroGrid}>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>
                Destination
              </Text>

              <Text style={styles.statValue}>
                {region || "-"}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>
                Total Stops
              </Text>

              <Text style={styles.statValue}>
                {totalStops}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>
                Total Budget
              </Text>

              <Text style={styles.statValue}>
                JPY{" "}
                {Number(
                  totalLocal
                ).toLocaleString()}
              </Text>
            </View>

          </View>

        </View>

        {/* BODY */}
        <View style={styles.body}>

          <Text style={styles.sectionTitle}>
            Itinerary
          </Text>

          {Object.entries(grouped).map(
            ([date, items], idx) => {

              const dayNumber =
                dayMap?.[date] || idx + 1;

              return (

                <View
                  key={date}
                  style={styles.dayCard}
                  wrap={false}
                >

                  <View style={styles.dayHeader}>

                    <Text style={styles.dayBadge}>
                      DAY {dayNumber}
                    </Text>

                    <Text style={styles.dayDate}>
                      {date}
                    </Text>

                  </View>

                  {items.map((row, i) => {

                    const mapUrl =
                      row.destination
                        ? `https://www.google.com/maps/search/${encodeURIComponent(
                            row.destination
                          )}`
                        : null;

                    const routeUrl =
                      row.from && row.to
                        ? `https://www.google.com/maps/dir/${encodeURIComponent(
                            row.from
                          )}/${encodeURIComponent(
                            row.to
                          )}`
                        : null;

                    const bookingUrl =
                      row.bookingLink ||
                      row.bookingUrl;

                    return (

                      <View
                        key={i}
                        style={styles.item}
                        wrap={false}
                      >

                        <View style={styles.itemTop}>

                          <View style={styles.itemLeft}>

                            <Text style={styles.itemTitle}>
                              {row.destination ||
                                "Untitled Stop"}
                            </Text>

                            <Text style={styles.itemRoute}>
                              {row.from || "-"} →{" "}
                              {row.to || "-"}
                            </Text>

                            {row.transportType && (
                              <Text
                                style={
                                  styles.transportBadge
                                }
                              >
                                {row.transportType}
                              </Text>
                            )}

                            <View style={styles.linksWrap}>

                              {mapUrl && (
                                <Link
                                  src={mapUrl}
                                  style={
                                    styles.linkPill
                                  }
                                >
                                  <Text
                                    style={
                                      styles.linkText
                                    }
                                  >
                                    MAP
                                  </Text>
                                </Link>
                              )}

                              {routeUrl && (
                                <Link
                                  src={routeUrl}
                                  style={
                                    styles.linkPill
                                  }
                                >
                                  <Text
                                    style={
                                      styles.linkText
                                    }
                                  >
                                    ROUTE
                                  </Text>
                                </Link>
                              )}

                              {bookingUrl && (
                                <Link
                                  src={bookingUrl}
                                  style={
                                    styles.linkPill
                                  }
                                >
                                  <Text
                                    style={
                                      styles.linkText
                                    }
                                  >
                                    BOOK
                                  </Text>
                                </Link>
                              )}

                            </View>

                          </View>

                          <View
                            style={
                              styles.budgetWrap
                            }
                          >

                            <Text
                              style={
                                styles.budgetLabel
                              }
                            >
                              Budget
                            </Text>

                            <Text
                              style={
                                styles.budgetValue
                              }
                            >
                              JPY{" "}
                              {Number(
                                row.budgetLocal ||
                                  0
                              ).toLocaleString()}
                            </Text>

                          </View>

                        </View>

                      </View>

                    );
                  })}

                </View>

              );
            }
          )}

          {/* SUMMARY */}
          <View style={styles.summaryCard}>

            <Text style={styles.summaryTitle}>
              Spending Overview
            </Text>

            {Object.entries(
              transportSummary
            ).map(([label, value]) => {

              const width =
                (value / maxTransport) *
                100;

              return (

                <View
                  key={label}
                  style={styles.progressRow}
                >

                  <View
                    style={styles.progressTop}
                  >

                    <Text
                      style={
                        styles.progressLabel
                      }
                    >
                      {label}
                    </Text>

                    <Text
                      style={
                        styles.progressValue
                      }
                    >
                      JPY{" "}
                      {Number(
                        value
                      ).toLocaleString()}
                    </Text>

                  </View>

                  <View
                    style={
                      styles.progressTrack
                    }
                  >

                    <View
                      style={{
                        ...styles.progressFill,
                        width: `${width}%`,
                      }}
                    />

                  </View>

                </View>

              );
            })}

          </View>

          {/* FOOTER */}
          <View style={styles.footer}>

            <Text>
              PREPARED WITH
              BACKPACKERVUN ·
              WWW.BACKPACKERVUN.COM
            </Text>

          </View>

        </View>

      </Page>

    </Document>
  );
}