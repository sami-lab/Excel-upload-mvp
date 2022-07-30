const express = require('express');
const filesController = require('../controllers/filesController');

//const protect = require('../middleware/protect');
const uploadgcd = require('../middleware/uploadgcd');
const router = express.Router();
//router.use(protect);

router
  .route('/')
  .post(uploadgcd('file', 'excelmvp/'), filesController.createOne)
  .get(filesController.getFiles);

router.route('/test').get(filesController.test);

router.route('/lastWeekRecords').get(filesController.getLastWeekFiles);
router.route('/getRecordByDate').post(filesController.getFilesByDate);
router.route('/:id').get(filesController.getFile).delete(filesController.delete);

module.exports = router;
//This controller is not finished
