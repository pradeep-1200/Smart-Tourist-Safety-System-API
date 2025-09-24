const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  tourist_id: {
    type: String,
    required: true,
    ref: 'Tourist'
  },
  type: {
    type: String,
    required: true,
    enum: ['panic_button', 'geofence_breach', 'inactivity', 'device_offline', 'emergency_contact'],
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && 
                 coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Invalid coordinates format'
      }
    }
  },
  address: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    index: true
  },
  sent_to: [{
    type: String,
    enum: ['tourist_app', 'emergency_contacts', 'nearest_police_unit', 'local_police', 'tourism_office']
  }],
  status: {
    type: String,
    required: true,
    enum: ['pending', 'acknowledged', 'in_progress', 'resolved', 'false_alarm'],
    default: 'pending',
    index: true
  },
  response_time: {
    type: Number, // in minutes
    min: 0
  },
  resolved_at: {
    type: Date
  },
  resolved_by: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  collection: 'alerts'
});

// Indexes for better query performance
alertSchema.index({ tourist_id: 1, timestamp: -1 });
alertSchema.index({ status: 1, severity: 1 });
alertSchema.index({ type: 1, timestamp: -1 });
alertSchema.index({ location: '2dsphere' });

// Virtual for calculating response time
alertSchema.virtual('responseTimeCalculated').get(function() {
  if (this.resolved_at && this.timestamp) {
    return Math.round((this.resolved_at - this.timestamp) / (1000 * 60)); // minutes
  }
  return null;
});

// Method to mark alert as resolved
alertSchema.methods.resolve = function(resolvedBy, notes) {
  this.status = 'resolved';
  this.resolved_at = new Date();
  this.resolved_by = resolvedBy;
  if (notes) this.notes = notes;
  this.response_time = this.responseTimeCalculated;
  return this.save();
};

// Static method to get active alerts
alertSchema.statics.getActiveAlerts = function() {
  return this.find({
    status: { $in: ['pending', 'acknowledged', 'in_progress'] }
  }).sort({ timestamp: -1 });
};

// Static method to get alerts by severity
alertSchema.statics.getBySeverity = function(severity) {
  return this.find({ severity }).sort({ timestamp: -1 });
};

module.exports = mongoose.model('Alert', alertSchema);
