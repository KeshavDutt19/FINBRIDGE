import express from 'express';

import User from '../models/User.js';
import BankScheme from '../models/BankScheme.js';

import {
  requireAuth,
} from '../middleware/auth.js';

import {
  findNearbyBanks,
} from '../services/googlePlaces.js';

import {
  normalizeBankName,
  getCanonicalBankName,
} from '../utils/bankMatcher.js';

const router = express.Router();

router.get(
  '/nearby-schemes',
  requireAuth,
  async (req, res) => {
    try {
      const latitude =
        Number(req.query.lat);

      const longitude =
        Number(req.query.lng);

      const radius =
        Number(req.query.radius || 5000);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        return res.status(400).json({
          message:
            'Valid latitude and longitude are required.',
        });
      }

      if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return res.status(400).json({
          message:
            'Coordinates are out of range.',
        });
      }

      const safeRadius = Math.min(
        Math.max(radius, 500),
        50000
      );

      /* ===================================
         GET USER'S PRIMARY BANK
      =================================== */

      const user =
        await User.findById(req.user.id)
          .select('profile');

      const primaryBank =
        user?.profile?.primaryBank || '';

      const primaryBankKey =
        normalizeBankName(primaryBank);

      /* ===================================
         GET NEARBY BANKS
      =================================== */

      const places =
        await findNearbyBanks({
          latitude,
          longitude,
          radius: safeRadius,
        });

      /* ===================================
         NORMALIZE BANK RESULTS
      =================================== */

      const nearbyBanks =
        places.map((place) => {
          const name =
            place.displayName?.text ||
            'Unknown Bank';

          return {
            placeId: place.id,

            name,

            canonicalName:
              getCanonicalBankName(name),

            address:
              place.formattedAddress ||
              '',

            latitude:
              place.location?.latitude,

            longitude:
              place.location?.longitude,

            mapsUrl:
              place.googleMapsUri ||
              null,

            businessStatus:
              place.businessStatus ||
              null,

            openingHours:
              place.regularOpeningHours ||
              null,
          };
        });

      /* ===================================
         UNIQUE BANK NAMES
      =================================== */

      const bankKeys = [
        ...new Set(
          nearbyBanks.map((bank) =>
            normalizeBankName(
              bank.name
            )
          )
        ),
      ];

      /* ===================================
         QUERY SCHEMES

         We query by normalized canonical
         names / aliases in MongoDB.
      =================================== */

      const schemes =
        await BankScheme.find({
          isActive: true,
          $or: [
            {
              bankName: {
                $in: bankKeys,
              },
            },

            {
              bankAliases: {
                $in: bankKeys,
              },
            },
          ],
        }).lean();

      /* ===================================
         PRIMARY BANK FIRST
      =================================== */

      const primarySchemes =
        schemes
          .filter(
            (scheme) =>
              normalizeBankName(
                scheme.bankName
              ) === primaryBankKey
          )
          .map((scheme) => ({
            ...scheme,
            priority: 0,
            isPrimaryBank: true,
          }));

      /* ===================================
         OTHER BANK SCHEMES
      =================================== */

      const otherSchemes =
        schemes
          .filter(
            (scheme) =>
              normalizeBankName(
                scheme.bankName
              ) !== primaryBankKey
          )
          .map((scheme) => ({
            ...scheme,
            priority: 1,
            isPrimaryBank: false,
          }));

      /* ===================================
         SORT
      =================================== */

      primarySchemes.sort(
        (a, b) =>
          new Date(b.updatedAt) -
          new Date(a.updatedAt)
      );

      otherSchemes.sort(
        (a, b) =>
          new Date(b.updatedAt) -
          new Date(a.updatedAt)
      );

      res.json({
        location: {
          latitude,
          longitude,
        },

        radius: safeRadius,

        primaryBank,

        nearbyBanks,

        primaryBankSchemes:
          primarySchemes,

        otherNearbySchemes:
          otherSchemes,
      });

    } catch (error) {
      console.error(
        'Nearby bank discovery error:',
        error
      );

      res.status(500).json({
        message:
          'Unable to load nearby banking offers.',
      });
    }
  }
);

export default router;