const Tourist = require('../models/Tourist');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');
const { generateTouristId } = require('../utils/helpers');

// Tourist Login
const loginTourist = async (req, res) => {
  try {
    const { dtid, passport_no } = req.body;

    // Validate input
    if (!dtid || !passport_no) {
      return res.status(400).json({
        success: false,
        message: 'DTID and Passport number are required'
      });
    }

    // Find tourist
    const tourist = await Tourist.findOne({
      _id: dtid,
      passport_no: passport_no.toUpperCase()
    });

    if (!tourist) {
      // Log failed login attempt
      logger.warn('Failed login attempt', {
        dtid,
        passport_no: passport_no.substring(0, 3) + '***',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if tourist ID is still valid
    if (!tourist.isValid) {
      return res.status(401).json({
        success: false,
        message: 'Tourist ID has expired or is inactive'
      });
    }

    // Update last seen
    await tourist.updateLastSeen();

    // Create audit log
    await AuditLog.create({
      _id: `LOG${Date.now()}`,
      event: 'tourist_login',
      tourist_id: tourist._id,
      user_role: 'tourist',
      details: 'Successful login via mobile app',
      ip_address: req.ip,
      device_info: req.get('User-Agent')
    });

    logger.info('Tourist login successful', {
      touristId: tourist._id,
      name: tourist.name,
      ip: req.ip
    });

    // Return tourist data (excluding sensitive info)
    const touristData = {
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
      last_seen: tourist.last_seen
    };

    res.json({
      success: true,
      message: 'Login successful',
      tourist: touristData
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Register Tourist (for staff use)
const registerTourist = async (req, res) => {
  try {
    const {
      name,
      passport_no,
      phone_no,
      nationality,
      trip_itinerary,
      emergency_contacts,
      valid_from,
      valid_to,
      registered_by
    } = req.body;

    // Generate unique DTID
    const dtid = generateTouristId();

    // Create new tourist
    const tourist = new Tourist({
      _id: dtid,
      name,
      passport_no: passport_no.toUpperCase(),
      phone_no,
      nationality,
      trip_itinerary,
      emergency_contacts,
      valid_from: new Date(valid_from),
      valid_to: new Date(valid_to),
      registered_by,
      safety_score: 75 // Default safety score
    });

    await tourist.save();

    // Create audit log
    await AuditLog.create({
      _id: `LOG${Date.now()}`,
      event: 'tourist_registered',
      tourist_id: dtid,
      user_role: 'staff',
      details: `Tourist registered by ${registered_by}`,
      ip_address: req.ip
    });

    logger.info('New tourist registered', {
      touristId: dtid,
      name,
      registeredBy: registered_by
    });

    res.status(201).json({
      success: true,
      message: 'Tourist registered successfully',
      tourist: {
        id: dtid,
        name,
        passport_no: passport_no.toUpperCase(),
        valid_from,
        valid_to
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tourist with this passport number already exists'
      });
    }

    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Get Tourist Profile
const getTouristProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const tourist = await Tourist.findById(id);

    if (!tourist) {
      return res.status(404).json({
        success: false,
        message: 'Tourist not found'
      });
    }

    const touristData = {
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

    res.json({
      success: true,
      tourist: touristData
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  loginTourist,
  registerTourist,
  getTouristProfile
};
