const GOOGLE_PLACES_URL =
  'https://places.googleapis.com/v1/places:searchNearby';

export async function findNearbyBanks({
  latitude,
  longitude,
  radius = 5000,
}) {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GOOGLE_MAPS_API_KEY is not configured'
    );
  }

  const response = await fetch(
    GOOGLE_PLACES_URL,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,

        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.location',
          'places.googleMapsUri',
          'places.businessStatus',
          'places.regularOpeningHours',
        ].join(','),
      },

      body: JSON.stringify({
        includedTypes: ['bank'],

        maxResultCount: 20,

        locationRestriction: {
          circle: {
            center: {
              latitude,
              longitude,
            },

            radius,
          },
        },

        rankPreference: 'DISTANCE',
      }),
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Google Places error: ${errorText}`
    );
  }

  const data = await response.json();

  return data.places || [];
}