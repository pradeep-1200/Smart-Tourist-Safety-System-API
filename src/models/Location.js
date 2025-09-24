const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  tourist_id: {
    type: String,
    required: true,
    ref: 'Tourist'
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;    // latitude
        },
        message: 'Invalid coordinates format'
      }
    }
  },
  address: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['normal', 'warning', 'danger'],
    default: 'normal'
  },
  accuracy: {
    type: Number,
    min: 0,
    default: 10
  },
  altitude: {
    type: Number
  },
  speed: {
    type: Number,
    min: 0
  },
  heading: {
    type: Number,
    min: 0,
    max: 360
  }
}, {
  timestamps: true,
  collection: 'locations'
});

// Create 2dsphere index for geospatial queries
locationSchema.index({ location: '2dsphere' });
locationSchema.index({ tourist_id: 1, timestamp: -1 });
locationSchema.index({ timestamp: -1 });

// Method to find nearby locations
locationSchema.statics.findNearby = function(longitude, latitude, maxDistance = 1000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  });
};

// Method to get latest location for a tourist
locationSchema.statics.getLatestForTourist = function(touristId) {
  return this.findOne({ tourist_id: touristId })
             .sort({ timestamp: -1 });
};

module.exports = mongoose.model('Location', locationSchema);
