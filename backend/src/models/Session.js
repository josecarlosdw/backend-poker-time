const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['active', 'voting', 'revealed', 'completed'],
    default: 'active'
  },
  votes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    card: {
      type: String,
      required: true
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  result: {
    average: Number,
    median: Number,
    min: Number,
    max: Number,
    consensus: Boolean
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Calculate results when status changes to revealed
sessionSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'revealed') {
    this.calculateResults();
  }
  next();
});

// Method to calculate voting results
sessionSchema.methods.calculateResults = function() {
  const numericVotes = this.votes
    .map(vote => parseFloat(vote.card))
    .filter(card => !isNaN(card));

  if (numericVotes.length > 0) {
    const sorted = numericVotes.sort((a, b) => a - b);
    const sum = numericVotes.reduce((acc, val) => acc + val, 0);
    
    this.result = {
      average: sum / numericVotes.length,
      median: sorted[Math.floor(sorted.length / 2)],
      min: Math.min(...numericVotes),
      max: Math.max(...numericVotes),
      consensus: Math.max(...numericVotes) - Math.min(...numericVotes) <= 2
    };
  }
};

// Index for better performance
sessionSchema.index({ room: 1, status: 1 });
sessionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Session', sessionSchema); 