const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/about');

router.get('/us', aboutController.renderAboutUs);
router.get('/diabetes', aboutController.renderDiabetes);

module.exports = router;
