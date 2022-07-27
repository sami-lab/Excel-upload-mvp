const express = require('express');
const userController = require('../Controllers/userController');
const authController = require('../Controllers/authController');

const protect = require('../middleware/protect');

const router = express.Router();

router.post('/Signup', authController.signUp);
router.post('/verifyEmail/:token', authController.verifyEmail);
router.post('/login', authController.login);

router.use(protect);
router.post('/validateToken', authController.validateUser);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);

router.route('/:id').get(userController.getUser);

module.exports = router;
