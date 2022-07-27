const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const Transaction = require('../Models/transactionModel');

exports.delete = catchAsync(async (req, res, next) => {
  const doc = await Transaction.findByIdAndDelete(req.params.id);
  if (!doc) {
    return next(new AppError('Requested Id not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: 'deleted Successfully',
  });
});

exports.createOne = catchAsync(async (req, res, next) => {
  const { description, amount } = req.body;
  console.log(amount, '----');
  const doc = await Transaction.create({
    description,
    amount,
    user: req.user.id,
  });
  res.status(201).json({
    status: 'success',
    data: {
      doc,
    },
  });
});

exports.getUserTransactions = catchAsync(async (req, res, next) => {
  const doc = await Transaction.find({ user: req.user.id });

  res.status(200).json({
    status: 'success',
    result: doc.length,
    data: { doc },
  });
});
