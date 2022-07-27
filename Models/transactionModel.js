const mongoose = require('mongoose');

var TransactionSchema = mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Transaction must have description'],
  },
  amount: {
    type: Number,
    validate: {
      validator: function (v) {
        return v !== 0;
      },
      message: 'Value cannot be zero',
    },
    required: [true, 'Transaction must have Amount'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    require: [true, 'Transaction must have user!'],
  },
});

var Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = Transaction;
