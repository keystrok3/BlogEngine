const express = require('express');
const db = require('../models/dbservice');
const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Post handlers


module.exports = router;