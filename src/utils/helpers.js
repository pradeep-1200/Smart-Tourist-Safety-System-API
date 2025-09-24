const generateTouristId = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TID${timestamp.slice(-6)}${random}`;
};

const generateLocationId = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `LOC${timestamp.slice(-6)}${random}`;
};

const generateAlertId = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `ALERT${timestamp.slice(-6)}${random}`;
};

const isValidCoordinates = (longitude, latitude) => {
  return longitude >= -180 && longitude <= 180 && 
         latitude >= -90 && latitude <= 90;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

const formatTouristData = (tourist) => {
  return {
    id: tourist._id,
    name: tourist.name,
    phone_no: tourist.phone_no,
    nationality: tourist.nationality,
    trip_itinerary: tourist.trip_itinerary,
    emergency_contacts: tourist.emergency_contacts,
    valid_from: tourist.valid_from,
    valid_to: tourist.valid_to,
    safety_score: tourist.safety_score,
    status: tourist.status,
    last_seen: tourist.last_seen,
    isValid: tourist.isValid
  };
};

module.exports = {
  generateTouristId,
  generateLocationId,
  generateAlertId,
  isValidCoordinates,
  calculateDistance,
  formatTouristData
};
