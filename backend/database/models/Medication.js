import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  dosage: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'as_needed'],
    default: 'daily'
  },
  times: [{
    type: String,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time format HH:MM']
  }],
  active: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

medicationSchema.index({ userId: 1, active: 1 });

export default mongoose.model('Medication', medicationSchema);
