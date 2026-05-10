"use client";

import DownloadPDFButton from "@/components/DownloadPDFButton";

export default function HomePage() {

  return (

    <main className="page-wrapper">

      <DownloadPDFButton />

      <div id="pdf-content">

        {/* COVER */}
        <section className="trip-cover">

          <div className="trip-title">
            Sydney Marathon 2026
          </div>

          <div className="trip-subtitle">
            Sydney • Blue Mountains • Bondi
          </div>

        </section>

        {/* DAY 1 */}
        <section className="day-block">

          <div className="day-header">

            <div className="day-badge">
              DAY 1
            </div>

            <h2>
              Arrival Sydney
            </h2>

            <p>
              Thursday, 10 September 2026
            </p>

          </div>

          {/* CARD */}
          <div className="day-item itinerary-card">

            <div className="card-top">

              <div className="time-badge">
                08:00
              </div>

              <div className="price-badge">
                AUD 20
              </div>

            </div>

            <h3>
              Arrive Sydney Airport
            </h3>

            <p>
              Immigration process and airport transfer.
            </p>

            <img
              src="https://images.unsplash.com/photo-1506973035872-a4ec16b8d5c1?q=80&w=1400"
              alt="Sydney Airport"
              className="spot-image"
            />

          </div>

          {/* CARD */}
          <div className="day-item itinerary-card">

            <div className="card-top">

              <div className="time-badge">
                13:00
              </div>

              <div className="price-badge">
                AUD 35
              </div>

            </div>

            <h3>
              Explore Circular Quay
            </h3>

            <p>
              Walk around Opera House and Harbour Bridge.
            </p>

            <img
              src="https://images.unsplash.com/photo-1523428096881-5bd79d043006?q=80&w=1400"
              alt="Circular Quay"
              className="spot-image"
            />

          </div>

        </section>

        {/* DAY 2 */}
        <section className="day-block">

          <div className="day-header">

            <div className="day-badge">
              DAY 2
            </div>

            <h2>
              Blue Mountains Day Trip
            </h2>

            <p>
              Friday, 11 September 2026
            </p>

          </div>

          {[...Array(6)].map((_, index) => (

            <div
              key={index}
              className="day-item itinerary-card"
            >

              <div className="card-top">

                <div className="time-badge">
                  {8 + index}:00
                </div>

                <div className="price-badge">
                  AUD 15
                </div>

              </div>

              <h3>
                Scenic Spot #{index + 1}
              </h3>

              <p>
                Beautiful landscape and adaptive
                pagination testing for long itinerary export.
              </p>

              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1400"
                alt={`Scenic Spot ${index + 1}`}
                className="spot-image"
              />

            </div>

          ))}

        </section>

        {/* SUMMARY */}
        <section className="summary-section">

          <h2>
            Trip Summary
          </h2>

          <div className="summary-card">

            <p>
              Total Days: 7
            </p>

            <p>
              Total Budget: AUD 2,400
            </p>

          </div>

        </section>

      </div>

    </main>

  );

}