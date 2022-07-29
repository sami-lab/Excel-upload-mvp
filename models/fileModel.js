const mongoose = require('mongoose');

var FileSchema = mongoose.Schema(
  {
    file: {
      type: String,
      required: [true, 'A File Object must have a name'],
      trim: true,
    },
    fileId: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Files = mongoose.model('Files', FileSchema);
module.exports = Files;
