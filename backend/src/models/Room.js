const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['participant', 'observer', 'moderator'],
      default: 'participant'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  settings: {
    cardSet: {
      type: [String],
      default: ['0', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '∞']
    },
    allowObservers: {
      type: Boolean,
      default: true
    },
    autoReveal: {
      type: Boolean,
      default: false
    }
  },
  relatedTask: {
    type: String,
    trim: true,
    maxlength: 200
  }
}, {
  timestamps: true
});

// Generate invite code before saving
roomSchema.pre('save', function(next) {
  if (this.isPrivate && !this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

// Index for better performance
roomSchema.index({ name: 1, owner: 1 });
roomSchema.index({ inviteCode: 1 });

module.exports = mongoose.model('Room', roomSchema); 