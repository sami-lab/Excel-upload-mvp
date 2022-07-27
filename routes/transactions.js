const express = require('express');
const transactionsController = require('../Controllers/transactionsController');

const protect = require('../middleware/protect');

const router = express.Router();
router.use(protect);

router.route('/').post(transactionsController.createOne);

router.route('/:id').delete(transactionsController.delete);

router.route('/:userId').delete(transactionsController.getUserTransactions);

module.exports = router;
//This controller is not finished
