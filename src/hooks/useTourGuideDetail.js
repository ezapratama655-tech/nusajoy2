import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";

import { supabase } from "../utils/supabaseClient";

/* =====================================================
   HELPER
===================================================== */

const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      return Array.isArray(parsed)
        ? parsed
        : [value];
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

/* =====================================================
   NORMALIZE GUIDE
===================================================== */

const normalizeGuide = (guide) => {
  if (!guide) {
    return null;
  }

  return {
    ...guide,

    id: guide.id,

    name:
      guide.name ||
      guide.full_name ||
      guide.nama ||
      "Pemandu Wisata",

    avatar:
      guide.avatar ||
      guide.photo ||
      guide.image ||
      guide.profile_photo ||
      null,

    city:
      guide.city ||
      guide.location ||
      guide.kota ||
      "Indonesia",

    rating: toNumber(
      guide.rating ?? guide.average_rating,
      0
    ),

    price_per_day: toNumber(
      guide.price_per_day ??
        guide.price ??
        guide.daily_price,
      0
    ),

    trips: toNumber(
      guide.trips ??
        guide.total_trips ??
        guide.completed_trips,
      0
    ),

    experience:
      guide.experience ??
      guide.experience_years ??
      0,

    languages: toArray(
      guide.languages
    ),

    specialties: toArray(
      guide.specialties
    ),

    category:
      guide.category ||
      guide.type ||
      "Lainnya",

    status:
      guide.status ||
      "offline",

    verified: Boolean(
      guide.verified ??
        guide.is_verified
    ),

    bio:
      guide.bio ||
      guide.description ||
      "Pemandu wisata lokal yang siap membantu perjalanan Anda.",
  };
};

/* =====================================================
   NORMALIZE REVIEW
===================================================== */

const normalizeReview = (review) => {
  if (!review) {
    return null;
  }

  return {
    ...review,

    id: review.id,

    guide_id:
      review.guide_id ||
      review.guideId,

    reviewer_name:
      review.reviewer_name ||
      review.user_name ||
      review.name ||
      "Wisatawan",

    reviewer_photo:
      review.reviewer_photo ||
      review.user_photo ||
      review.avatar ||
      null,

    rating: toNumber(
      review.rating,
      0
    ),

    comment:
      review.comment ||
      review.content ||
      review.review ||
      "",

    created_at:
      review.created_at ||
      review.createdAt ||
      null,
  };
};

/* =====================================================
   NORMALIZE SCHEDULE
===================================================== */

const normalizeSchedule = (schedule) => {
  if (!schedule) {
    return null;
  }

  const date =
    schedule.date ||
    schedule.schedule_date ||
    schedule.booking_date ||
    schedule.day ||
    null;

  const startTime =
    schedule.start_time ||
    schedule.startTime ||
    schedule.start ||
    null;

  const endTime =
    schedule.end_time ||
    schedule.endTime ||
    schedule.end ||
    null;

  const available =
    schedule.is_available ??
    schedule.available ??
    (
      schedule.status
        ? schedule.status === "available"
        : true
    );

  return {
    ...schedule,

    id: schedule.id,

    guide_id:
      schedule.guide_id ||
      schedule.guideId,

    date,

    startTime,

    endTime,

    start_time: startTime,

    end_time: endTime,

    available: Boolean(
      available
    ),

    is_available: Boolean(
      available
    ),

    status:
      schedule.status ||
      (
        available
          ? "available"
          : "unavailable"
      ),
  };
};

/* =====================================================
   HOOK
===================================================== */

export const useTourGuideDetail = (
  guideId
) => {
  const [guide, setGuide] =
    useState(null);

  const [reviews, setReviews] =
    useState([]);

  const [schedules, setSchedules] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [bookingLoading, setBookingLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  /*
    Digunakan untuk memastikan response lama
    tidak menimpa response terbaru.
  */
  const requestIdRef =
    useRef(0);

  /* ===================================================
     FETCH DETAIL
  =================================================== */

  const fetchDetail = useCallback(
    async () => {
      if (!guideId) {
        setGuide(null);
        setReviews([]);
        setSchedules([]);
        setError(null);
        setLoading(false);

        return;
      }

      const requestId =
        ++requestIdRef.current;

      try {
        setLoading(true);
        setError(null);

        /* ===============================================
           1. GET GUIDE
        =============================================== */

        const {
          data: guideData,
          error: guideError,
        } = await supabase
          .from("tour_guides")
          .select("*")
          .eq("id", guideId)
          .maybeSingle();

        if (guideError) {
          throw guideError;
        }

        if (!guideData) {
          throw new Error(
            "Data pemandu wisata tidak ditemukan."
          );
        }

        /*
          Bila user berpindah guide saat request
          masih berjalan, hentikan update state.
        */
        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        /* ===============================================
           2. GET REVIEWS + SCHEDULES
        =============================================== */

        const [
          reviewResult,
          scheduleResult,
        ] = await Promise.allSettled([
          supabase
            .from("reviews")
            .select("*")
            .eq("guide_id", guideId)
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("schedules")
            .select("*")
            .eq("guide_id", guideId),
        ]);

        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        /* ===============================================
           REVIEW
        =============================================== */

        let normalizedReviews = [];

        if (
          reviewResult.status ===
          "fulfilled"
        ) {
          const result =
            reviewResult.value;

          if (result.error) {
            /*
              Reviews bukan critical.
              Guide tetap bisa ditampilkan.
            */
            console.warn(
              "Gagal mengambil reviews:",
              result.error.message
            );
          } else {
            normalizedReviews = (
              result.data || []
            )
              .map(normalizeReview)
              .filter(Boolean);
          }
        } else {
          console.warn(
            "Reviews tidak dapat dimuat."
          );
        }

        /* ===============================================
           SCHEDULE
        =============================================== */

        let normalizedSchedules = [];

        if (
          scheduleResult.status ===
          "fulfilled"
        ) {
          const result =
            scheduleResult.value;

          if (result.error) {
            /*
              Schedule juga bukan critical
              untuk halaman detail.
            */
            console.warn(
              "Gagal mengambil schedules:",
              result.error.message
            );
          } else {
            normalizedSchedules = (
              result.data || []
            )
              .map(normalizeSchedule)
              .filter(Boolean);

            /*
              Sorting dilakukan di JavaScript
              sehingga tidak bergantung pada
              nama kolom tertentu di Supabase.
            */
            normalizedSchedules.sort(
              (a, b) => {
                const dateA = a.date
                  ? new Date(
                      a.date
                    ).getTime()
                  : Infinity;

                const dateB = b.date
                  ? new Date(
                      b.date
                    ).getTime()
                  : Infinity;

                return (
                  dateA - dateB
                );
              }
            );
          }
        } else {
          console.warn(
            "Schedules tidak dapat dimuat."
          );
        }

        /* ===============================================
           SET STATE
        =============================================== */

        setGuide(
          normalizeGuide(
            guideData
          )
        );

        setReviews(
          normalizedReviews
        );

        setSchedules(
          normalizedSchedules
        );
      } catch (err) {
        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        console.error(
          "Error fetching tour guide detail:",
          err
        );

        setGuide(null);
        setReviews([]);
        setSchedules([]);

        setError(
          err?.message ||
            "Gagal memuat data pemandu wisata."
        );
      } finally {
        if (
          requestId ===
          requestIdRef.current
        ) {
          setLoading(false);
        }
      }
    },
    [guideId]
  );

  /* ===================================================
     EFFECT
  =================================================== */

  useEffect(() => {
    fetchDetail();

    return () => {
      requestIdRef.current += 1;
    };
  }, [fetchDetail]);

  /* ===================================================
     REVIEW STATISTICS
  =================================================== */

  const averageRating =
    useMemo(() => {
      /*
        Jika tidak ada review yang berhasil dimuat,
        gunakan rating dari tabel tour_guides.
      */
      if (!reviews.length) {
        return guide?.rating || 0;
      }

      const total =
        reviews.reduce(
          (sum, review) =>
            sum +
            toNumber(
              review.rating
            ),
          0
        );

      return Number(
        (
          total /
          reviews.length
        ).toFixed(1)
      );
    }, [reviews, guide]);

  const reviewCount =
    reviews.length;

  /* ===================================================
     AVAILABLE SCHEDULE
  =================================================== */

  const availableSchedules =
    useMemo(() => {
      return schedules.filter(
        (schedule) =>
          schedule.available !==
            false &&
          schedule.status !==
            "booked" &&
          schedule.status !==
            "unavailable"
      );
    }, [schedules]);

  /* ===================================================
     NEXT SCHEDULE
  =================================================== */

  const nextSchedule =
    useMemo(() => {
      const now = new Date();

      return (
        availableSchedules.find(
          (schedule) => {
            if (!schedule.date) {
              return false;
            }

            const date =
              new Date(
                schedule.date
              );

            return date >= now;
          }
        ) || null
      );
    }, [availableSchedules]);

  /* ===================================================
     SUBMIT BOOKING
  =================================================== */

  const submitBooking =
    useCallback(
      async (
        bookingData = {}
      ) => {
        /*
          Validasi guide ID
        */
        if (!guideId) {
          return {
            success: false,
            data: null,
            error:
              "ID pemandu tidak ditemukan.",
          };
        }

        /*
          Validasi minimal tanggal booking
        */
        if (
          !bookingData.booking_date
        ) {
          return {
            success: false,
            data: null,
            error:
              "Tanggal booking belum dipilih.",
          };
        }

        try {
          setBookingLoading(true);

          /*
            guide_id ditentukan dari route/detail.
            Nilai dari bookingData tidak dapat
            mengganti guide aktif.
          */
          const payload = {
            ...bookingData,
            guide_id: guideId,
          };

          const {
            data,
            error: bookingError,
          } = await supabase
            .from("bookings")
            .insert([payload])
            .select()
            .single();

          if (bookingError) {
            throw bookingError;
          }

          return {
            success: true,
            data,
            error: null,
          };
        } catch (err) {
          console.error(
            "Booking error:",
            err
          );

          return {
            success: false,
            data: null,
            error:
              err?.message ||
              "Gagal membuat pemesanan.",
          };
        } finally {
          setBookingLoading(false);
        }
      },
      [guideId]
    );

  /* ===================================================
     RETURN
  =================================================== */

  return {
    guide,

    reviews,

    schedules,

    availableSchedules,

    nextSchedule,

    averageRating,

    reviewCount,

    loading,

    bookingLoading,

    error,

    refetch: fetchDetail,

    submitBooking,
  };
};

/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default useTourGuideDetail;