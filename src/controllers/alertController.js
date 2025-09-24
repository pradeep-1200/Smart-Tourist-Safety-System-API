const Alert = require('../models/Alert');
const Tourist = require('../models/Tourist');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');
const { generateAlertId } = require('../utils/helpers');
const notificationService = require('../services/notificationService');

// Create Panic Alert
const createPanicAlert = async (req, res) => {
  try {
    const { tourist_id, latitude, longitude, address } = req.body;

    if (!tourist_id || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Tourist ID and location are required'
      });
    }

    const tourist = await Tourist.findById(tourist_id);
    if (!tourist) {
      return res.status(404).json({
        success: false,
        message: 'Tourist not found'
      });
    }

    // Create panic alert
    const alert = new Alert({
      _id: generateAlertId(),
      tourist_id,
      type: 'panic_button',
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      address,
      description: 'Emergency panic button pressed by tourist',
      severity: 'critical',
      sent_to: ['nearest_police_unit', 'emergency_contacts']
    });

    await alert.save();

    // Send notifications
    await notificationService.sendPanicAlert(tourist, alert);

    // Create audit log
    await AuditLog.create({
      _id: `LOG${Date.now()}`,
      event: 'panic_alert_triggered',
      tourist_id,
      user_role: 'tourist',
      details: 'Panic button pressed via mobile app',
      ip_address: req.ip,
      alert_id: alert._id
    });

    logger.error('PANIC ALERT TRIGGERED', {
      touristId: tourist_id,
      touristName: tourist.name,
      coordinates: [longitude, latitude],
      alertId: alert._id
    });

    res.status(201).json({
      success: true,
      message: 'Panic alert sent successfully',
      alert: {
        id: alert._id,
        timestamp: alert.timestamp,
        status: alert.status
      }
    });

  } catch (error) {
    logger.error('Panic alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during panic alert'
    });
  }
};

// Get Tourist Alerts
const getTouristAlerts = async (req, res) => {
  try {
    const { tourist_id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const alerts = await Alert.find({ tourist_id })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const alertData = alerts.map(alert => ({
      id: alert._id,
      type: alert.type,
      timestamp: alert.timestamp,
      location: alert.location,
      address: alert.address,
      description: alert.description,
      severity: alert.severity,
      status: alert.status,
      response_time: alert.response_time
    }));

    res.json({
      success: true,
      alerts: alertData,
      count: alertData.length
    });

  } catch (error) {
    logger.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createPanicAlert,
  getTouristAlerts
};
