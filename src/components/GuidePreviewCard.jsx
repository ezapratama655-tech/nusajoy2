/**
 * @file src/components/GuidePreviewCard.jsx
 * NuSaJoy — Reusable Guide Preview Card
 */

import { useMemo } from 'react'

import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Heart,
  MapPin,
  Navigation,
  Star,
} from 'lucide-react'

import {
  formatGuidePrice,
  getGuideAvatar,
  getGuideCity,
  getGuideExperience,
  getGuideName,
  getGuidePrice,
  getGuideSpecialties,
  getGuideTrips,
  getGuideRating,
  isGuideAvailable,
} from '../utils/guide'

export default function GuidePreviewCard({
  guide,
  onOpen,
  onToggleFavorite,
  isFavorite = false,
  compact = false,
}) {
  const normalized = useMemo(
    () => guide,
    [guide]
  )

  if (!normalized) {
    return null
  }

  const avatar =
    getGuideAvatar(normalized)

  const name =
    getGuideName(normalized)

  const city =
    getGuideCity(normalized)

  const rating =
    getGuideRating(normalized)

  const trips =
    getGuideTrips(normalized)

  const experience =
    getGuideExperience(normalized)

  const price =
    getGuidePrice(normalized)

  const specialties =
    getGuideSpecialties(
      normalized
    )

  const available =
    isGuideAvailable(
      normalized
    )

  const handleOpen = () => {
    onOpen?.(normalized)
  }

  return (
    <article
      className={`nj-guide-card ${
        compact
          ? 'nj-guide-card-compact'
          : ''
      }`}
    >
      <div className="nj-guide-card-media">
        <button
          type="button"
          className="nj-guide-media-button"
          onClick={handleOpen}
          aria-label={`Lihat profil ${name}`}
        >
          <img
            src={avatar}
            alt={name}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display =
                'none'
            }}
          />
        </button>

        <div className="nj-guide-image-shade" />

        <div
          className={`nj-guide-status ${
            available
              ? ''
              : 'is-offline'
          }`}
        >
          <span />
          {available
            ? 'Tersedia'
            : 'Offline'}
        </div>

        {normalized.verified && (
          <div className="nj-guide-verified">
            <BadgeCheck
              size={13}
            />
            Terverifikasi
          </div>
        )}

        <button
          type="button"
          className={`nj-guide-favorite ${
            isFavorite
              ? 'is-active'
              : ''
          }`}
          onClick={(event) => {
            event.stopPropagation()
            onToggleFavorite?.(
              normalized
            )
          }}
          aria-label={
            isFavorite
              ? 'Hapus dari favorit'
              : 'Simpan ke favorit'
          }
          aria-pressed={
            isFavorite
          }
        >
          <Heart
            size={18}
            fill={
              isFavorite
                ? 'currentColor'
                : 'none'
            }
          />
        </button>
      </div>

      <div className="nj-guide-card-content">
        <div className="nj-guide-card-heading">
          <div className="nj-guide-name-wrap">
            <button
              type="button"
              className="nj-guide-name-button"
              onClick={handleOpen}
            >
              {name}
            </button>

            {normalized.verified && (
              <BadgeCheck
                size={16}
                className="nj-guide-name-verified"
              />
            )}
          </div>

          <div className="nj-guide-rating">
            <Star
              size={14}
              fill="currentColor"
            />
            <strong>
              {rating
                ? rating.toFixed(1)
                : '5.0'}
            </strong>
          </div>
        </div>

        <div className="nj-guide-location">
          <MapPin size={14} />
          <span>
            {city}
          </span>
        </div>

        {specialties.length >
          0 && (
          <div className="nj-guide-specialties">
            {specialties
              .slice(0, 3)
              .map((specialty) => (
                <span
                  key={
                    specialty
                  }
                >
                  {specialty}
                </span>
              ))}
          </div>
        )}

        <div className="nj-guide-meta-grid">
          <div>
            <Clock3
              size={14}
            />

            <span>
              {experience !==
              null
                ? `${experience} thn`
                : 'Berpengalaman'}
            </span>
          </div>

          <div>
            <Navigation
              size={14}
            />

            <span>
              {trips}+
              {' '}
              trip
            </span>
          </div>
        </div>

        <div className="nj-guide-card-footer">
          <div className="nj-guide-price">
            <span>
              Mulai dari
            </span>

            <strong>
              {formatGuidePrice(
                price
              )}
            </strong>

            <small>
              /{guide.priceUnit === 'trip' ? 'trip' : 'hari'}
            </small>
          </div>

          <button
            type="button"
            className="nj-guide-detail-button"
            onClick={handleOpen}
          >
            Detail
            <ArrowRight
              size={15}
            />
          </button>
        </div>
      </div>
    </article>
  )
}