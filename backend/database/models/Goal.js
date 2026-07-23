import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  metricType: {
    type: String,
    enum: ['steps', 'weight', 'sleepHours', 'water', 'calories', 'other'],
    required: true
  },
  targetValue: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  }
}, {
  timestamps: true
});

goalSchema.index({ userId: 1, status: 1 });

export default mongoose.model('Goal', goalSchema);
