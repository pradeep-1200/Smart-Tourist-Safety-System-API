const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  relationship: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  }
});

const touristSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  passport_no: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  phone_no: {
    type: String,
    required: true,
    trim: true
  },
  nationality: {
    type: String,
    required: true,
    trim: true
  },
  trip_itinerary: [{
    type: String,
    trim: true
  }],
  emergency_contacts: [emergencyContactSchema],
  valid_from: {
    type: Date,
    required: true
  },
  valid_to: {
    type: Date,
    required: true
  },
  registered_by: {
    type: String,
    required: true,
    trim: true
  },
  registered_at: {
    type: Date,
    default: Date.now
  },
  safety_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 75
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  last_seen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'tourists'
});

// Create indexes separately (no duplicate indexing)
touristSchema.index({ status: 1 });
touristSchema.index({ valid_from: 1, valid_to: 1 });

// Virtual for checking if tourist ID is still valid
touristSchema.virtual('isValid').get(function() {
  const now = new Date();
  return now >= this.valid_from && now <= this.valid_to && this.status === 'active';
});

// Method to update last seen
touristSchema.methods.updateLastSeen = function() {
  this.last_seen = new Date();
  return this.save();
};

module.exports = mongoose.model('Tourist', touristSchema);
