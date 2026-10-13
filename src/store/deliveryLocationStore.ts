import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { UserAddress } from './addressStore';

export interface DeliveryLocation {
  id?: string;
  locality?: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
  addressLine?: string;
  displayShort: string;
  displayFull: string;
  latitude?: number;
  longitude?: number;
  type: 'gps' | 'address' | 'manual';
  updatedAt?: number;
}

export interface PincodeDetails {
  pincode: string;
  district: string;
  state: string;
  region: string;
  postOffices: string[];
}

interface DeliveryLocationState {
  currentLocation: DeliveryLocation;
  isDetecting: boolean;
  lastError: string | null;

  detectCurrentLocation: () => Promise<{ success: boolean; error?: string; location?: DeliveryLocation }>;
  selectSavedAddress: (address: UserAddress) => void;
  setManualLocation: (city: string, state?: string, pincode?: string, locality?: string) => void;
  lookupPincode: (pincode: string) => Promise<PincodeDetails | null>;
  resetError: () => void;
}

const DEFAULT_LOCATION: DeliveryLocation = {
  locality: 'Central',
  city: 'Kolkata',
  district: 'Kolkata',
  state: 'West Bengal',
  pincode: '700001',
  addressLine: 'Central Kolkata',
  displayShort: 'Kolkata, West Bengal',
  displayFull: 'Central Kolkata, Kolkata, West Bengal - 700001',
  type: 'manual',
};

// Clean and capitalize place names nicely
const formatPlaceName = (name: string): string => {
  if (!name) return '';
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const useDeliveryLocationStore = create<DeliveryLocationState>()(
  persist(
    (set, get) => ({
      currentLocation: DEFAULT_LOCATION,
      isDetecting: false,
      lastError: null,

      resetError: () => set({ lastError: null }),

      detectCurrentLocation: async () => {
        set({ isDetecting: true, lastError: null });

        try {
          // 1. Request permission
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            const err =
              'Permission to access location was denied. Please allow location access in your device or browser settings.';
            set({ isDetecting: false, lastError: err });
            return { success: false, error: err };
          }

          // 2. High-Accuracy Coordinates Detection
          let latitude: number | null = null;
          let longitude: number | null = null;

          if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
            try {
              const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: true,
                  timeout: 15000,
                  maximumAge: 0,
                });
              });
              latitude = pos.coords.latitude;
              longitude = pos.coords.longitude;
            } catch (webGeoErr) {
              // Fallback to Expo Location if browser geolocation failed
              const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
              });
              latitude = position.coords.latitude;
              longitude = position.coords.longitude;
            }
          } else {
            const position = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Highest,
            });
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
          }

          if (latitude == null || longitude == null) {
            throw new Error('Could not obtain GPS coordinates.');
          }

          // 3. Multi-tier Reverse Geocoding
          let locality = '';
          let city = '';
          let district = '';
          let state = '';
          let pincode = '';
          let street = '';

          // Tier A: OpenStreetMap Nominatim with high zoom (18)
          try {
            const resp = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              {
                headers: {
                  'Accept-Language': 'en',
                },
              }
            );
            if (resp.ok) {
              const data = await resp.json();
              const addr = data.address || {};

              // Locality / Area
              locality =
                addr.suburb ||
                addr.neighbourhood ||
                addr.residential ||
                addr.village ||
                addr.hamlet ||
                addr.town ||
                '';

              // City / District / County
              city = addr.city || addr.town || addr.municipality || '';
              district = addr.state_district || addr.county || addr.district || '';
              state = addr.state || '';
              pincode = addr.postcode || '';
              street = [addr.building, addr.road, addr.commercial].filter(Boolean).join(', ');
            }
          } catch (e) {
            // Proceed to Expo reverseGeocode
          }

          // Tier B: Expo Location Reverse Geocode
          try {
            const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (geocode && geocode.length > 0) {
              const res = geocode[0];
              if (!locality) locality = res.name || res.district || '';
              if (!city) city = res.city || res.subregion || '';
              if (!district) district = res.district || res.subregion || '';
              if (!state) state = res.region || '';
              if (!pincode) pincode = res.postalCode || '';
              if (!street) {
                street = [res.streetNumber, res.street].filter(Boolean).join(' ');
              }
            }
          } catch (e) {
            // Ignore
          }

          // Tier C: Indian Postal API validation for official District & Region
          if (pincode && /^\d{6}$/.test(pincode)) {
            try {
              const pinRes = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
              if (pinRes.ok) {
                const pinData = await pinRes.json();
                if (pinData && pinData[0]?.Status === 'Success' && pinData[0]?.PostOffice?.length > 0) {
                  const po = pinData[0].PostOffice[0];
                  if (!district || district === locality) {
                    district = po.District || district;
                  }
                  if (!state) {
                    state = po.State || state;
                  }
                  // If city was empty, check if region or district can provide it
                  if (!city) {
                    city = po.District || po.Region || '';
                  }
                  // If locality was empty, use post office name
                  if (!locality) {
                    locality = po.Name || '';
                  }
                }
              }
            } catch (e) {
              // Ignore postal API fallback
            }
          }

          // Format clean strings
          locality = formatPlaceName(locality);
          city = formatPlaceName(city);
          district = formatPlaceName(district);
          state = formatPlaceName(state);

          // Build a readable, proper short display for the navbar:
          // e.g. "Fatehpur, South 24 Parganas" or "Salt Lake, Kolkata" or "Haripal, Hooghly"
          let displayShort = '';
          const primaryArea = locality || city || district || 'Current Location';
          const secondaryArea =
            city && city.toLowerCase() !== primaryArea.toLowerCase()
              ? city
              : district && district.toLowerCase() !== primaryArea.toLowerCase()
              ? district
              : state && state.toLowerCase() !== primaryArea.toLowerCase()
              ? state
              : '';

          if (secondaryArea) {
            displayShort = `${primaryArea}, ${secondaryArea}`;
          } else if (pincode) {
            displayShort = `${primaryArea} - ${pincode}`;
          } else {
            displayShort = primaryArea;
          }

          // Build full descriptive address
          const fullParts = [
            street,
            locality,
            city && city !== locality ? city : '',
            district && district !== city && district !== locality ? district : '',
            state,
            pincode,
          ].filter(Boolean);

          const displayFull = fullParts.join(', ') || displayShort;

          const detectedLocation: DeliveryLocation = {
            locality,
            city: city || district || primaryArea,
            district,
            state: state || 'West Bengal',
            pincode,
            addressLine: street || locality || displayShort,
            displayShort,
            displayFull,
            latitude,
            longitude,
            type: 'gps',
            updatedAt: Date.now(),
          };

          set({
            currentLocation: detectedLocation,
            isDetecting: false,
            lastError: null,
          });

          return { success: true, location: detectedLocation };
        } catch (error: any) {
          const err =
            error?.message || 'Failed to detect location. Please check your GPS connection.';
          set({ isDetecting: false, lastError: err });
          return { success: false, error: err };
        }
      },

      lookupPincode: async (pincode: string): Promise<PincodeDetails | null> => {
        const clean = pincode.trim();
        if (!/^\d{6}$/.test(clean)) return null;

        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`);
          if (!res.ok) return null;
          const data = await res.json();
          if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
            const list = data[0].PostOffice;
            const first = list[0];
            return {
              pincode: clean,
              district: first.District || '',
              state: first.State || '',
              region: first.Region || '',
              postOffices: list.map((p: any) => p.Name).filter(Boolean),
            };
          }
          return null;
        } catch {
          return null;
        }
      },

      selectSavedAddress: (addr: UserAddress) => {
        const cleanCity = formatPlaceName(addr.city);
        const cleanState = formatPlaceName(addr.state);
        const displayShort = cleanCity
          ? `${cleanCity}${addr.pincode ? ` - ${addr.pincode}` : (cleanState ? `, ${cleanState}` : '')}`
          : addr.name;
        const displayFull = `${addr.addressLine}, ${cleanCity}, ${cleanState} - ${addr.pincode}`;

        const newLoc: DeliveryLocation = {
          id: addr.id,
          city: cleanCity,
          district: cleanCity,
          state: cleanState,
          pincode: addr.pincode,
          addressLine: addr.addressLine,
          displayShort,
          displayFull,
          type: 'address',
          updatedAt: Date.now(),
        };

        set({
          currentLocation: newLoc,
          lastError: null,
        });
      },

      setManualLocation: (
        city: string,
        state: string = 'West Bengal',
        pincode: string = '',
        locality: string = ''
      ) => {
        const cleanCity = formatPlaceName(city);
        const cleanState = formatPlaceName(state);
        const cleanPin = pincode.trim();
        const cleanLocality = formatPlaceName(locality);

        const primary = cleanLocality || cleanCity;
        const secondary = cleanCity && cleanCity !== cleanLocality ? cleanCity : cleanState;

        const displayShort = secondary
          ? `${primary}, ${secondary}${cleanPin ? ` (${cleanPin})` : ''}`
          : cleanPin
          ? `${primary} - ${cleanPin}`
          : primary;

        const newLoc: DeliveryLocation = {
          locality: cleanLocality,
          city: cleanCity || primary,
          district: cleanCity,
          state: cleanState,
          pincode: cleanPin,
          addressLine: displayShort,
          displayShort,
          displayFull: [cleanLocality, cleanCity, cleanState, cleanPin].filter(Boolean).join(', '),
          type: 'manual',
          updatedAt: Date.now(),
        };

        set({
          currentLocation: newLoc,
          lastError: null,
        });
      },
    }),
    {
      name: 'adonik-delivery-location',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
