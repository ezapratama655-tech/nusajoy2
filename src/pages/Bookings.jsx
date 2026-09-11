import { useState } from "react";
import { CalendarDays, MapPin, Clock, Users, Search, Ticket } from "lucide-react";

import "../styles/Bookings.css";

const bookingData = [
  {
    id: 1,
    destination: "Kawah Ijen",
    location: "Banyuwangi, Jawa Timur",
    date: "15 September 2026",
    time: "08.00 WIB",
    guests: 2,
    status: "Akan Datang",
    image:
      "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    destination: "Labuan Bajo",
    location: "Nusa Tenggara Timur",
    date: "22 September 2026",
    time: "09.30 WIB",
    guests: 4,
    status: "Akan Datang",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    destination: "Raja Ampat",
    location: "Papua Barat Daya",
    date: "10 Agustus 2026",
    time: "10.00 WIB",
    guests: 3,
    status: "Selesai",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80",
  },
];

export default function Bookings() {
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [search, setSearch] = useState("");

  const filters = ["Semua", "Akan Datang", "Selesai"];

  const filteredBookings = bookingData.filter((booking) => {
    const matchFilter =
      activeFilter === "Semua" ||
      booking.status === activeFilter;

    const matchSearch =
      booking.destination
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      booking.location
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchFilter && matchSearch;
  });

  return (
    <section className="bookings-page">
      <div className="bookings-container">

        {/* HEADER */}
        <div className="bookings-header">
          <div>
            <span className="bookings-eyebrow">
              PERJALANAN KAMU
            </span>

            <h1>Pesanan Saya</h1>

            <p>
              Kelola dan lihat semua pesanan perjalanan
              kamu bersama NuSaJoy.
            </p>
          </div>

          <div className="bookings-icon">
            <Ticket size={28} />
          </div>
        </div>


        {/* SEARCH */}
        <div className="bookings-toolbar">

          <div className="booking-search">
            <Search size={19} />

            <input
              type="text"
              placeholder="Cari pesanan..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>


          {/* FILTER */}
          <div className="booking-filters">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={
                  activeFilter === filter
                    ? "booking-filter active"
                    : "booking-filter"
                }
                onClick={() =>
                  setActiveFilter(filter)
                }
              >
                {filter}
              </button>
            ))}
          </div>

        </div>


        {/* BOOKING LIST */}
        <div className="booking-list">

          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (

              <article
                className="booking-card"
                key={booking.id}
              >

                <div className="booking-image-wrapper">

                  <img
                    src={booking.image}
                    alt={booking.destination}
                    className="booking-image"
                  />

                  <span
                    className={
                      booking.status === "Akan Datang"
                        ? "booking-status upcoming"
                        : "booking-status completed"
                    }
                  >
                    {booking.status}
                  </span>

                </div>


                <div className="booking-content">

                  <div className="booking-main">

                    <h2>
                      {booking.destination}
                    </h2>

                    <p className="booking-location">
                      <MapPin size={17} />

                      {booking.location}
                    </p>

                  </div>


                  <div className="booking-details">

                    <div className="booking-detail-item">
                      <CalendarDays size={18} />

                      <span>
                        {booking.date}
                      </span>
                    </div>


                    <div className="booking-detail-item">
                      <Clock size={18} />

                      <span>
                        {booking.time}
                      </span>
                    </div>


                    <div className="booking-detail-item">
                      <Users size={18} />

                      <span>
                        {booking.guests} Orang
                      </span>
                    </div>

                  </div>


                  <div className="booking-actions">

                    <button
                      type="button"
                      className="booking-detail-button"
                    >
                      Lihat Detail
                    </button>

                    {booking.status === "Akan Datang" && (
                      <button
                        type="button"
                        className="booking-contact-button"
                      >
                        Hubungi
                      </button>
                    )}

                  </div>

                </div>

              </article>

            ))
          ) : (

            <div className="booking-empty">

              <Ticket size={45} />

              <h2>
                Pesanan Tidak Ditemukan
              </h2>

              <p>
                Tidak ada pesanan yang sesuai dengan
                pencarian atau filter kamu.
              </p>

            </div>

          )}

        </div>

      </div>
    </section>
  );
}