const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const Files = require('../models/fileModel');

exports.delete = catchAsync(async (req, res, next) => {
  const doc = await Files.findByIdAndDelete(req.params.id);
  if (!doc) {
    return next(new AppError('Requested Id not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: 'deleted Successfully',
  });
});

exports.createOne = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const doc = await Files.create({
    name,
  });
  res.status(201).json({
    status: 'success',
    data: {
      doc,
    },
  });
});

exports.getFile = catchAsync(async (req, res, next) => {
  const doc = await Files.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { doc },
  });
});
exports.getFiles = catchAsync(async (req, res, next) => {
  const doc = await Files.find();

  res.status(200).json({
    status: 'success',
    result: doc.length,
    data: { doc },
  });
});
exports.getLastWeekFiles = catchAsync(async (req, res, next) => {
  let lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const doc = await Files.find({ date: { $gte: lastWeek } });

  res.status(200).json({
    status: 'success',
    result: doc.length,
    data: { doc },
  });
});

exports.getFilesByDate = catchAsync(async (req, res, next) => {
  const { date } = req.body;

  let lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const doc = await Files.find({ date: new Date(date) });

  res.status(200).json({
    status: 'success',
    result: doc.length,
    data: { doc },
  });
});
