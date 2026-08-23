import { api } from './api.js';

export async function getNearbyBankOffers({
  latitude,
  longitude,
  radius = 5000,
}) {
  const params =
    new URLSearchParams({
      lat: latitude.toString(),
      lng: longitude.toString(),
      radius: radius.toString(),
    });

  return api(
    `/banks/nearby-schemes?${params.toString()}`
  );
}