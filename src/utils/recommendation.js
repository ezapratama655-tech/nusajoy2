/**
 * Menghitung skor kecocokan pengalaman
 * dengan preferensi pengguna.
 *
 * Bobot:
 * - minat/tag       : 50%
 * - budget          : 30%
 * - lokasi          : 20%
 *
 * Fungsi dibuat fleksibel agar bisa menerima
 * beberapa bentuk data yang berbeda dari
 * mockData NuSaJoy.
 */
export const calculateMatchScore = (
  item,
  preferences = {},
) => {
  if (
    !item ||
    typeof item !== 'object'
  ) {
    return 0;
  }

  const {
    interests = [],
    selectedInterests = [],
    budget = 0,
    location = 'semua',
  } = preferences;


  /* =====================================================
     INTEREST SCORE
  ===================================================== */

  const userInterests = [
    ...(Array.isArray(interests)
      ? interests
      : []),

    ...(Array.isArray(
      selectedInterests,
    )
      ? selectedInterests
      : []),
  ]
    .map((value) =>
      String(value)
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean);

  const itemTags = [
    ...(Array.isArray(item.tags)
      ? item.tags
      : []),

    ...(Array.isArray(
      item.interestTags,
    )
      ? item.interestTags
      : []),

    ...(Array.isArray(
      item.interests,
    )
      ? item.interests
      : []),
  ]
    .map((value) =>
      String(value)
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean);

  let interestScore = 0;

  if (
    userInterests.length > 0 &&
    itemTags.length > 0
  ) {
    const matched =
      userInterests.filter(
        (interest) =>
          itemTags.includes(
            interest,
          ),
      ).length;

    interestScore =
      Math.min(
        1,
        matched /
          userInterests.length,
      );
  }


  /* =====================================================
     BUDGET SCORE
  ===================================================== */

  const itemPrice =
    Number(
      item.pricePerPerson ??
      item.price ??
      item.pricePerDay ??
      item.startingPrice ??
      0,
    );

  const userBudget =
    Number(budget);

  let budgetScore;

  if (
    Number.isFinite(
      userBudget,
    ) &&
    userBudget > 0 &&
    itemPrice > 0
  ) {
    if (
      itemPrice <= userBudget
    ) {
      budgetScore = 1;
    } else {
      /**
       * Semakin jauh dari budget,
       * skor semakin turun.
       */
      const difference =
        itemPrice -
        userBudget;

      budgetScore =
        Math.max(
          0,
          1 -
            difference /
              userBudget,
        );
    }
  } else {
    /**
     * Bila budget belum dipilih,
     * jangan menghukum skor.
     */
    budgetScore = 1;
  }


  /* =====================================================
     LOCATION SCORE
  ===================================================== */

  const requestedLocation =
    String(
      location || 'semua',
    )
      .trim()
      .toLowerCase();

  const itemLocation =
    String(
      item.location ??
      item.address ??
      item.city ??
      '',
    )
      .trim()
      .toLowerCase();

  let locationScore = 1;

  if (
    requestedLocation !==
      'semua' &&
    requestedLocation
  ) {
    const normalizedLocation =
      requestedLocation
        .replace(
          /[^a-z0-9]+/g,
          ' ',
        )
        .trim();

    locationScore =
      itemLocation.includes(
        normalizedLocation,
      ) ||
      normalizedLocation.includes(
        itemLocation,
      )
        ? 1
        : 0;
  }


  /* =====================================================
     FINAL SCORE
  ===================================================== */

  const score =
    interestScore * 0.5 +
    budgetScore * 0.3 +
    locationScore * 0.2;


  /**
   * Kembalikan 0–100.
   */
  return Math.round(
    score * 100,
  );
};