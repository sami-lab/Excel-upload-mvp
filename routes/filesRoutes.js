const express = require('express');
const filesController = require('../controllers/filesController');

//const protect = require('../middleware/protect');
const uploadServer = require('../middleware/uploadServer');
const router = express.Router();
//router.use(protect);

router
  .route('/')
  .post(uploadServer.single('file'), filesController.createOne)
  .get(filesController.getFiles);

router.route('/:id').get(filesController.getFile).delete(filesController.delete);

router.route('/lastWeekRecords').get(filesController.getLastWeekFiles);
router.route('/getRecordByDate').post(filesController.getLastWeekFiles);
module.exports = router;
//This controller is not finished
