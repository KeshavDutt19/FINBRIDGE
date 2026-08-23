export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error(
          'Geolocation is not supported by this browser.'
        )
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,

          accuracy:
            position.coords.accuracy,
        });
      },

      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(
              new Error(
                'Location permission was denied.'
              )
            );
            break;

          case error.POSITION_UNAVAILABLE:
            reject(
              new Error(
                'Your location is currently unavailable.'
              )
            );
            break;

          case error.TIMEOUT:
            reject(
              new Error(
                'Location request timed out.'
              )
            );
            break;

          default:
            reject(
              new Error(
                'Unable to determine your location.'
              )
            );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  });
}