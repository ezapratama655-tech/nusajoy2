import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { supabase } from '../utils/supabaseClient'
import { normalizeGuide } from '../utils/guide'


const toNumber = (value, fallback = 0) => {
  const parsed = Number(value)

  return Number.isFinite(parsed)
    ? parsed
    : fallback
}


const normalizeReview = (review) => ({
  ...review,

  id: review.id,

  guide_id:
    review.guide_id ??
    review.guideId,

  reviewer_name:
    review.reviewer_name ??
    review.user_name ??
    review.name ??
    'Wisatawan',

  reviewer_photo:
    review.reviewer_photo ??
    review.user_photo ??
    review.avatar ??
    null,

  rating:
    toNumber(review.rating, 0),

  comment:
    review.comment ??
    review.content ??
    review.review ??
    '',

  created_at:
    review.created_at ??
    review.createdAt ??
    null,
})


const normalizeSchedule = (schedule) => {
  const date =
    schedule.date ??
    schedule.schedule_date ??
    schedule.booking_date ??
    schedule.day ??
    null

  const startTime =
    schedule.start_time ??
    schedule.startTime ??
    schedule.start ??
    null

  const endTime =
    schedule.end_time ??
    schedule.endTime ??
    schedule.end ??
    null

  const available =
    schedule.is_available ??
    schedule.available ??
    (
      schedule.status
        ? schedule.status === 'available'
        : true
    )

  return {
    ...schedule,

    id: schedule.id,

    guide_id:
      schedule.guide_id ??
      schedule.guideId,

    date,

    startTime,

    endTime,

    start_time:
      startTime,

    end_time:
      endTime,

    available:
      Boolean(available),

    is_available:
      Boolean(available),

    status:
      schedule.status ??
      (
        available
          ? 'available'
          : 'unavailable'
      ),
  }
}


export const useTourGuideDetail = (
  guideId,
  {
    fallbackGuide = null,
  } = {},
) => {
  const [guide, setGuide] =
    useState(null)

  const [reviews, setReviews] =
    useState([])

  const [schedules, setSchedules] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [bookingLoading, setBookingLoading] =
    useState(false)

  const [error, setError] =
    useState(null)

  const requestIdRef =
    useRef(0)


  // ===================================================
  // FETCH DETAIL
  // ===================================================

  const fetchDetail =
    useCallback(
      async () => {

        if (!guideId) {
          setGuide(null)

          setReviews([])

          setSchedules([])

          setError(null)

          setLoading(false)

          return
        }


        const requestId =
          ++requestIdRef.current


        try {
          setLoading(true)

          setError(null)


          const {
            data: guideData,
            error: guideError,
          } = await supabase
            .from('tour_guides')
            .select('*')
            .eq('id', guideId)
            .maybeSingle()


          if (
            guideError &&
            !fallbackGuide
          ) {
            throw guideError
          }


          if (
            !guideData &&
            !fallbackGuide
          ) {
            throw new Error(
              'Data pemandu wisata tidak ditemukan.'
            )
          }


          if (
            requestId !==
            requestIdRef.current
          ) {
            return
          }


          const [
            reviewResult,
            scheduleResult,
          ] = await Promise.allSettled([
            supabase
              .from('reviews')
              .select('*')
              .eq('guide_id', guideId)
              .order(
                'created_at',
                {
                  ascending: false,
                }
              ),

            supabase
              .from('schedules')
              .select('*')
              .eq('guide_id', guideId),
          ])


          if (
            requestId !==
            requestIdRef.current
          ) {
            return
          }


          let normalizedReviews =
            []


          if (
            reviewResult.status ===
              'fulfilled' &&
            !reviewResult.value.error
          ) {
            normalizedReviews =
              (
                reviewResult.value.data ||
                []
              ).map(
                normalizeReview
              )
          }


          let normalizedSchedules =
            []


          if (
            scheduleResult.status ===
              'fulfilled' &&
            !scheduleResult.value.error
          ) {
            normalizedSchedules =
              (
                scheduleResult.value.data ||
                []
              ).map(
                normalizeSchedule
              )


            normalizedSchedules.sort(
              (a, b) => {
                const aTime =
                  a.date
                    ? new Date(
                        `${a.date}T${
                          a.startTime ||
                          '00:00:00'
                        }`
                      ).getTime()
                    : Number.POSITIVE_INFINITY


                const bTime =
                  b.date
                    ? new Date(
                        `${b.date}T${
                          b.startTime ||
                          '00:00:00'
                        }`
                      ).getTime()
                    : Number.POSITIVE_INFINITY


                return aTime - bTime
              }
            )
          }


          setGuide(
            normalizeGuide(
              guideData ||
              fallbackGuide
            )
          )


          setReviews(
            normalizedReviews
          )


          setSchedules(
            normalizedSchedules
          )

        } catch (
          requestError
        ) {

          if (
            requestId !==
            requestIdRef.current
          ) {
            return
          }


          console.error(
            'NuSaJoy guide detail error:',
            requestError
          )


          setGuide(null)

          setReviews([])

          setSchedules([])

          setError(
            requestError?.message ||
              'Gagal memuat data pemandu wisata.'
          )

        } finally {

          if (
            requestId ===
            requestIdRef.current
          ) {
            setLoading(false)
          }

        }
      },
      [
        fallbackGuide,
        guideId,
      ]
    )


  // ===================================================
  // AUTO FETCH
  // ===================================================

  useEffect(() => {
    const timerId =
      window.setTimeout(() => {
        void fetchDetail()
      }, 0)


    return () => {
      window.clearTimeout(
        timerId
      )

      requestIdRef.current += 1
    }
  }, [fetchDetail])


  // ===================================================
  // AVERAGE RATING
  // ===================================================

  const averageRating =
    useMemo(() => {

      if (
        !reviews.length
      ) {
        return (
          guide?.rating ||
          0
        )
      }


      return Number(
        (
          reviews.reduce(
            (
              sum,
              review
            ) =>
              sum +
              review.rating,
            0
          ) /
          reviews.length
        ).toFixed(1)
      )

    }, [
      guide,
      reviews,
    ])


  // ===================================================
  // AVAILABLE SCHEDULES
  // ===================================================

  const availableSchedules =
    useMemo(
      () =>
        schedules.filter(
          (schedule) =>
            schedule.available !==
              false &&
            ![
              'booked',
              'unavailable',
            ].includes(
              schedule.status
            )
        ),
      [schedules]
    )


  // ===================================================
  // NEXT SCHEDULE
  // ===================================================

  const nextSchedule =
    useMemo(() => {

      const now =
        new Date()


      return (
        availableSchedules.find(
          (schedule) => {

            if (
              !schedule.date
            ) {
              return false
            }


            return (
              new Date(
                `${schedule.date}T${
                  schedule.startTime ||
                  '23:59:59'
                }`
              ) >= now
            )
          }
        ) ||
        null
      )

    }, [
      availableSchedules,
    ])


  // ===================================================
  // SUBMIT BOOKING
  // ===================================================

  const submitBooking =
    useCallback(
      async (
        bookingData = {}
      ) => {

        if (!guideId) {
          return {
            success: false,
            data: null,
            error:
              'ID pemandu tidak ditemukan.',
          }
        }


        if (
          !bookingData.booking_date
        ) {
          return {
            success: false,
            data: null,
            error:
              'Tanggal booking belum dipilih.',
          }
        }


        try {
          setBookingLoading(
            true
          )


          const payload = {
            ...bookingData,
            guide_id: guideId,
          }


          const {
            data,
            error: bookingError,
          } = await supabase
            .from('bookings')
            .insert([
              payload,
            ])
            .select()
            .single()


          if (
            bookingError
          ) {
            throw bookingError
          }


          return {
            success: true,
            data,
            error: null,
          }

        } catch (
          bookingError
        ) {

          console.error(
            'NuSaJoy booking error:',
            bookingError
          )


          return {
            success: false,
            data: null,
            error:
              bookingError?.message ||
              'Gagal membuat pemesanan.',
          }

        } finally {

          setBookingLoading(
            false
          )

        }
      },
      [guideId]
    )


  // ===================================================
  // RETURN
  // ===================================================

  return {
    guide,

    reviews,

    schedules,

    availableSchedules,

    nextSchedule,

    averageRating,

    reviewCount:
      reviews.length,

    loading,

    bookingLoading,

    error,

    refetch:
      fetchDetail,

    submitBooking,
  }
}


export default useTourGuideDetail