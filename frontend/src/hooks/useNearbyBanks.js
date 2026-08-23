import {
  useCallback,
  useState,
} from 'react';

import {
  getCurrentPosition,
} from '../lib/geolocation.js';

import {
  getNearbyBankOffers,
} from '../lib/nearbyBanks.js';

export function useNearbyBanks() {
  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const findNearbyBanks =
    useCallback(async () => {
      try {
        setLoading(true);
        setError('');

        const position =
          await getCurrentPosition();

        const result =
          await getNearbyBankOffers({
            latitude:
              position.latitude,

            longitude:
              position.longitude,

            radius: 5000,
          });

        setData({
          ...result,
          accuracy:
            position.accuracy,
        });

        return result;

      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []);

  return {
    data,
    loading,
    error,
    findNearbyBanks,
  };
}