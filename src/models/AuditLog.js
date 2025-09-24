const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  event: {
    type: String,
    required: true,
    enum: [
      'tourist_registered',
      'tourist_login',
      'tourist_logout',
      'panic_alert_triggered',
      'geofence_breach',
      'location_updated',
      'profile_updated',
      'alert_resolved',
      'system_access'
    ],
    index: true
  },
  tourist_id: {
    type: String,
    ref: 'Tourist',
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  user_role: {
    type: String,
    required: true,
    enum: ['tourist', 'staff', 'police', 'admin', 'system'],
    index: true
  },
  user_id: {
    type: String,
    trim: true
  },
  details: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  ip_address: {
    type: String,
    trim: true
  },
  device_info: {
    type: String,
    trim: true
  },
  alert_id: {
    type: String,
    ref: 'Alert'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  collection: 'audit_logs'
});

// Indexes for better query performance
auditLogSchema.index({ event: 1, timestamp: -1 });
auditLogSchema.index({ tourist_id: 1, timestamp: -1 });
auditLogSchema.index({ user_role: 1, timestamp: -1 });

// Static method to log events
auditLogSchema.statics.logEvent = async function(eventData) {
  try {
    const logId = `LOG${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const auditLog = new this({
      _id: logId,
      ...eventData,
      timestamp: new Date()
    });
    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error('Audit log error:', error);
    throw error;
  }
};

// Static method to get logs by tourist
auditLogSchema.statics.getLogsByTourist = function(touristId, limit = 50) {
  return this.find({ tourist_id: touristId })
             .sort({ timestamp: -1 })
             .limit(limit);
};

// Static method to get logs by event type
auditLogSchema.statics.getLogsByEvent = function(eventType, limit = 100) {
  return this.find({ event: eventType })
             .sort({ timestamp: -1 })
             .limit(limit);
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
