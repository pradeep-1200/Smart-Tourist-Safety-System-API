const logger = require('../utils/logger');
const { calculateDistance } = require('../utils/helpers');

// Sample dangerous/restricted zones in Northeast India
const RESTRICTED_ZONES = [
  {
    id: 'DANGER_001',
    name: 'Restricted Military Area - Tezpur',
    coordinates: [92.7933, 26.6337],
    radius: 2000, // 2km radius
    type: 'military',
    severity: 'critical',
    description: 'Military restricted area - no civilian access'
  },
  {
    id: 'DANGER_002', 
    name: 'Landslide Prone Area - Cherrapunji',
    coordinates: [91.7362, 25.2624],
    radius: 1500, // 1.5km radius
    type: 'natural_hazard',
    severity: 'high',
    description: 'High landslide risk area - avoid during monsoon'
  },
  {
    id: 'DANGER_003',
    name: 'Border Area - Indo-Myanmar Border',
    coordinates: [94.5980, 25.2677],
    radius: 5000, // 5km radius
    type: 'border',
    severity: 'high',
    description: 'International border area - requires special permits'
  },
  {
    id: 'CAUTION_001',
    name: 'Dense Forest Area - Kaziranga',
    coordinates: [93.3562, 26.5775],
    radius: 3000, // 3km radius
    type: 'wildlife',
    severity: 'medium',
    description: 'Dense forest with wildlife - guided tours recommended'
  }
];

// Night time restrictions (8 PM to 6 AM)
const NIGHT_TIME_ZONES = [
  {
    id: 'NIGHT_001',
    name: 'Remote Highway - NH37',
    coordinates: [91.7458, 26.1733],
    radius: 1000,
    type: 'highway',
    severity: 'medium',
    description: 'Remote highway section - not safe for night travel'
  }
];

class GeofenceService {

  // Check if location violates any geofences
  async checkGeofence(longitude, latitude) {
    try {
      const currentTime = new Date();
      const isNightTime = currentTime.getHours() >= 20 || currentTime.getHours() <= 6;

      // Check restricted zones
      for (const zone of RESTRICTED_ZONES) {
        const distance = calculateDistance(
          latitude, longitude,
          zone.coordinates[1], zone.coordinates[0]
        );

        if (distance <= zone.radius) {
          logger.warn('Geofence violation detected', {
            zoneId: zone.id,
            zoneName: zone.name,
            distance: Math.round(distance),
            severity: zone.severity,
            coordinates: [longitude, latitude]
          });

          return {
            violation: true,
            zoneId: zone.id,
            zoneName: zone.name,
            zoneType: zone.type,
            severity: zone.severity,
            description: zone.description,
            distance: Math.round(distance),
            action: 'immediate_alert'
          };
        }
      }

      // Check night time restrictions
      if (isNightTime) {
        for (const zone of NIGHT_TIME_ZONES) {
          const distance = calculateDistance(
            latitude, longitude,
            zone.coordinates[1], zone.coordinates[0]
          );

          if (distance <= zone.radius) {
            logger.warn('Night time geofence violation', {
              zoneId: zone.id,
              zoneName: zone.name,
              time: currentTime.toISOString(),
              distance: Math.round(distance)
            });

            return {
              violation: true,
              zoneId: zone.id,
              zoneName: zone.name,
              zoneType: 'night_restriction',
              severity: 'medium',
              description: `${zone.description} (Night time: ${currentTime.getHours()}:${currentTime.getMinutes().toString().padStart(2, '0')})`,
              distance: Math.round(distance),
              action: 'warning_alert'
            };
          }
        }
      }

      // No violations found
      return {
        violation: false,
        status: 'safe',
        message: 'Location is within safe zones'
      };

    } catch (error) {
      logger.error('Geofence check error:', error);
      return {
        violation: false,
        error: true,
        message: 'Unable to check geofence - assuming safe'
      };
    }
  }

  // Get all restricted zones (for map display)
  getRestrictedZones() {
    return {
      restricted: RESTRICTED_ZONES,
      nightTime: NIGHT_TIME_ZONES
    };
  }

  // Add custom geofence (for future enhancement)
  addCustomGeofence(zoneData) {
    try {
      const customZone = {
        id: `CUSTOM_${Date.now()}`,
        ...zoneData,
        created_at: new Date()
      };

      // In a real implementation, this would be saved to database
      logger.info('Custom geofence added', { zoneId: customZone.id });

      return { success: true, zone: customZone };
    } catch (error) {
      logger.error('Failed to add custom geofence:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new GeofenceService();
