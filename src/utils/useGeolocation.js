import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";


// =====================================================
// NUSAJOY GEOLOCATION HOOK
// =====================================================


// -----------------------------------------------------
// DEFAULT OPTIONS
// -----------------------------------------------------

const DEFAULT_OPTIONS = {

  enableHighAccuracy: true,

  timeout: 15000,

  maximumAge: 60000,

};


// =====================================================
// ERROR MESSAGE HELPER
// =====================================================

function getGeolocationErrorMessage(error) {

  if (!error) {
    return "Terjadi kesalahan saat mengambil lokasi.";
  }


  switch (error.code) {

    case 1:

      return "Izin lokasi ditolak. Izinkan akses lokasi untuk menggunakan fitur pemandu terdekat.";


    case 2:

      return "Lokasi kamu tidak dapat ditemukan. Pastikan GPS atau layanan lokasi aktif.";


    case 3:

      return "Pengambilan lokasi membutuhkan waktu terlalu lama. Silakan coba lagi.";


    default:

      return error.message ||
        "Terjadi kesalahan saat mengambil lokasi.";
  }
}


// =====================================================
// CUSTOM HOOK
// =====================================================

export default function useGeolocation(
  customOptions = {}
) {

  // ---------------------------------------------------
  // LOCATION STATE
  // ---------------------------------------------------

  const [location, setLocation] =
    useState(null);


  // ---------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------

  const [loading, setLoading] =
    useState(false);


  // ---------------------------------------------------
  // ERROR STATE
  // ---------------------------------------------------

  const [error, setError] =
    useState(null);


  // ---------------------------------------------------
  // ACCURACY
  // ---------------------------------------------------

  const [accuracy, setAccuracy] =
    useState(null);


  // ---------------------------------------------------
  // LAST UPDATED
  // ---------------------------------------------------

  const [lastUpdated, setLastUpdated] =
    useState(null);


  // ---------------------------------------------------
  // WATCH ID
  // ---------------------------------------------------

  const watchIdRef =
    useRef(null);


  // ---------------------------------------------------
  // OPTIONS
  // ---------------------------------------------------

  const options = {
    ...DEFAULT_OPTIONS,
    ...customOptions,
  };


  // ===================================================
  // CHECK GEOLOCATION SUPPORT
  // ===================================================

  const isSupported = () => {

    return (
      typeof navigator !== "undefined" &&
      "geolocation" in navigator
    );

  };


  // ===================================================
  // HANDLE SUCCESS
  // ===================================================

  const handleSuccess = useCallback(
    (position) => {

      const {
        latitude,
        longitude,
        accuracy: positionAccuracy,
      } = position.coords;


      const newLocation = {

        latitude,

        longitude,

        lat: latitude,

        lng: longitude,

      };


      setLocation(newLocation);


      setAccuracy(
        positionAccuracy ?? null
      );


      setLastUpdated(
        new Date()
      );


      setError(null);


      setLoading(false);

    },
    []
  );


  // ===================================================
  // HANDLE ERROR
  // ===================================================

  const handleError = useCallback(
    (positionError) => {

      setError(
        getGeolocationErrorMessage(
          positionError
        )
      );


      setLoading(false);

    },
    []
  );


  // ===================================================
  // GET CURRENT LOCATION
  // ===================================================

  const getLocation = useCallback(
    () => {

      // Check browser support
      if (!isSupported()) {

        setError(
          "Browser ini tidak mendukung fitur geolocation."
        );

        setLoading(false);

        return;

      }


      setLoading(true);

      setError(null);


      navigator.geolocation.getCurrentPosition(

        handleSuccess,

        handleError,

        options

      );

    },
    [
      handleSuccess,
      handleError,
    ]
  );


  // ===================================================
  // RESET LOCATION
  // ===================================================

  const resetLocation = useCallback(
    () => {

      setLocation(null);

      setError(null);

      setAccuracy(null);

      setLastUpdated(null);

      setLoading(false);

    },
    []
  );


  // ===================================================
  // START WATCHING LOCATION
  // ===================================================

  const startWatching = useCallback(
    () => {

      if (!isSupported()) {

        setError(
          "Browser ini tidak mendukung fitur geolocation."
        );

        return;

      }


      // Jangan membuat watcher baru
      // jika watcher sebelumnya masih aktif

      if (
        watchIdRef.current !== null
      ) {
        return;
      }


      setLoading(true);

      setError(null);


      const watchId =
        navigator.geolocation.watchPosition(

          handleSuccess,

          handleError,

          options

        );


      watchIdRef.current =
        watchId;

    },
    [
      handleSuccess,
      handleError,
    ]
  );


  // ===================================================
  // STOP WATCHING LOCATION
  // ===================================================

  const stopWatching = useCallback(
    () => {

      if (
        watchIdRef.current !== null &&
        isSupported()
      ) {

        navigator.geolocation.clearWatch(
          watchIdRef.current
        );

        watchIdRef.current =
          null;

      }

    },
    []
  );


  // ===================================================
  // AUTO CLEANUP
  // ===================================================

  useEffect(
    () => {

      return () => {

        if (
          watchIdRef.current !== null &&
          typeof navigator !== "undefined" &&
          navigator.geolocation
        ) {

          navigator.geolocation.clearWatch(
            watchIdRef.current
          );

        }

      };

    },
    []
  );


  // ===================================================
  // RETURN
  // ===================================================

  return {

    // Location object
    location,


    // Shortcut coordinates
    latitude:
      location?.latitude ?? null,


    longitude:
      location?.longitude ?? null,


    // Loading
    loading,


    // Error
    error,


    // Accuracy
    accuracy,


    // Time
    lastUpdated,


    // Browser support
    supported:
      isSupported(),


    // Functions
    getLocation,

    resetLocation,

    startWatching,

    stopWatching,

  };

}


// =====================================================
// FORMAT DISTANCE
// =====================================================

export function formatDistance(
  distance
) {

  if (
    distance === null ||
    distance === undefined ||
    Number.isNaN(distance)
  ) {

    return null;

  }


  const numericDistance =
    Number(distance);


  if (
    !Number.isFinite(
      numericDistance
    )
  ) {

    return null;

  }


  // Less than 1 kilometer

  if (
    numericDistance < 1
  ) {

    return `${Math.round(
      numericDistance * 1000
    )} m`;

  }


  // Kilometers

  if (
    numericDistance < 10
  ) {

    return `${numericDistance.toFixed(
      1
    )} km`;

  }


  return `${Math.round(
    numericDistance
  )} km`;

}


// =====================================================
// CALCULATE DISTANCE
// HAVERSINE FORMULA
// =====================================================

export function calculateDistance(
  startLatitude,
  startLongitude,
  endLatitude,
  endLongitude
) {

  const values = [

    startLatitude,

    startLongitude,

    endLatitude,

    endLongitude,

  ];


  // Validate coordinates

  const invalidCoordinate =
    values.some(
      (value) => {

        return (
          value === null ||
          value === undefined ||
          !Number.isFinite(
            Number(value)
          )
        );

      }
    );


  if (invalidCoordinate) {

    return null;

  }


  // Earth radius in kilometers

  const earthRadius = 6371;


  // Convert degrees to radians

  const toRadians =
    (degree) => {

      return (
        Number(degree) *
        Math.PI
      ) / 180;

    };


  const latitudeDifference =
    toRadians(
      Number(endLatitude) -
      Number(startLatitude)
    );


  const longitudeDifference =
    toRadians(
      Number(endLongitude) -
      Number(startLongitude)
    );


  const startLatitudeRadians =
    toRadians(
      startLatitude
    );


  const endLatitudeRadians =
    toRadians(
      endLatitude
    );


  // Haversine formula

  const haversineValue =

    Math.sin(
      latitudeDifference / 2
    ) ** 2

    +

    Math.cos(
      startLatitudeRadians
    )

    *

    Math.cos(
      endLatitudeRadians
    )

    *

    Math.sin(
      longitudeDifference / 2
    ) ** 2;


  const angularDistance =

    2 *

    Math.atan2(

      Math.sqrt(
        haversineValue
      ),

      Math.sqrt(
        1 - haversineValue
      )

    );


  return (
    earthRadius *
    angularDistance
  );

}