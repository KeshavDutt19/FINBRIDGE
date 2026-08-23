import {
  Building2,
  ExternalLink,
  LocateFixed,
  MapPin,
} from 'lucide-react';

import {
  useNearbyBanks,
} from '../hooks/useNearbyBanks.js';

export default function NearbyBankOffers() {
  const {
    data,
    loading,
    error,
    findNearbyBanks,
  } = useNearbyBanks();

  if (!data) {
    return (
      <section className="fb-card p-6">

        <div className="flex items-start gap-4">

          <div className="fb-icon">
            <LocateFixed size={20} />
          </div>

          <div className="min-w-0 flex-1">

            <p className="fb-eyebrow">
              Nearby banking
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Find banking offers near you
            </h2>

            <p className="mt-2 text-sm leading-6 text-black/45">
              Allow location access to discover nearby
              bank branches and see your primary bank's
              offers first.
            </p>

            <button
              className="btn-primary mt-5"
              onClick={findNearbyBanks}
              disabled={loading}
            >
              <LocateFixed size={16} />

              {loading
                ? 'Finding nearby banks...'
                : 'Use my location'}
            </button>

            {error && (
              <p className="mt-3 text-sm text-red-600">
                {error}
              </p>
            )}

          </div>

        </div>

      </section>
    );
  }

  return (
    <section className="space-y-6">

      {/* Primary bank */}

      <div className="fb-card-dark p-6">

        <div className="flex items-start justify-between gap-4">

          <div>

            <p className="fb-eyebrow-dark">
              Your primary bank
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              {data.primaryBank ||
                'Primary bank not set'}
            </h2>

          </div>

          <Building2
            size={24}
            className="text-[#d7ee82]"
          />

        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">

          {data.primaryBankSchemes
            .slice(0, 4)
            .map((scheme) => (

              <div
                key={scheme._id}
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  p-5
                "
              >

                <div className="flex items-center justify-between gap-3">

                  <div>

                    <p className="text-xs text-white/35">
                      {scheme.category}
                    </p>

                    <h3 className="mt-1 font-semibold">
                      {scheme.schemeTitle}
                    </h3>

                  </div>

                  <span
                    className="
                      rounded-full
                      bg-[#d7ee82]
                      px-2.5
                      py-1
                      text-[10px]
                      font-bold
                      text-[#11110f]
                    "
                  >
                    Primary
                  </span>

                </div>

                {scheme.interestRate && (
                  <p className="
                    mt-4
                    text-2xl
                    font-semibold
                    text-[#d7ee82]
                  ">
                    {scheme.interestRate}
                  </p>
                )}

              </div>
            ))}

        </div>

      </div>

      {/* Nearby branches */}

      <div className="fb-card p-6">

        <div>

          <p className="fb-eyebrow">
            Nearby branches
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Banks within 5 km
          </h2>

        </div>

        <div className="mt-5 grid gap-3">

          {data.nearbyBanks.map((bank) => (

            <div
              key={bank.placeId}
              className="
                flex
                items-center
                gap-4
                rounded-2xl
                border
                border-black/[0.07]
                p-4
              "
            >

              <div className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#f4f1ea]
                text-[#375b32]
              ">
                <Building2 size={19} />
              </div>

              <div className="min-w-0 flex-1">

                <p className="font-semibold">
                  {bank.name}
                </p>

                <p className="
                  mt-1
                  flex
                  items-center
                  gap-1
                  text-xs
                  text-black/40
                ">
                  <MapPin size={12} />
                  {bank.address}
                </p>

              </div>

              {bank.mapsUrl && (
                <a
                  href={bank.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-black/10
                    transition
                    hover:-translate-y-0.5
                  "
                  title="Open in Google Maps"
                >
                  <ExternalLink size={15} />
                </a>
              )}

            </div>
          ))}

        </div>

      </div>

      {/* Other schemes */}

      <div className="fb-card p-6">

        <p className="fb-eyebrow">
          Nearby bank offers
        </p>

        <h2 className="mt-2 text-2xl font-semibold">
          Other banks near you
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">

          {data.otherNearbySchemes
            .slice(0, 6)
            .map((scheme) => (

              <div
                key={scheme._id}
                className="
                  rounded-2xl
                  border
                  border-black/[0.07]
                  bg-[#faf9f6]
                  p-5
                "
              >

                <p className="text-xs font-bold uppercase tracking-wide text-black/35">
                  {scheme.bankName}
                </p>

                <h3 className="mt-2 font-semibold">
                  {scheme.schemeTitle}
                </h3>

                <div className="mt-4 flex items-end justify-between">

                  <div>

                    <p className="text-xs text-black/35">
                      {scheme.category}
                    </p>

                    {scheme.interestRate && (
                      <p className="mt-1 text-xl font-bold">
                        {scheme.interestRate}
                      </p>
                    )}

                  </div>

                  <span className="
                    rounded-full
                    bg-[#dcebd8]
                    px-3
                    py-1
                    text-[10px]
                    font-bold
                    text-[#375b32]
                  ">
                    Nearby
                  </span>

                </div>

              </div>
            ))}

        </div>

      </div>

    </section>
  );
}