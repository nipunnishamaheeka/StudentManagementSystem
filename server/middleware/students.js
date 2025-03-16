const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST api/students
// @desc    Create a new student
// @access  Private
router.post(
    '/',
    [
        auth,
        upload.single('image'),
        [
            check('name', 'Name is required').not().isEmpty(),
            check('age', 'Age must be a number between 1 and 100').isInt({ min: 1, max: 100 })
        ]
    ],
    studentController.createStudent
);

// @route   GET api/students
// @desc    Get all students
// @access  Private
router.get('/', auth, studentController.getStudents);

// @route   GET api/students/:id
// @desc    Get a student by ID
// @access  Private
router.get('/:id', auth, studentController.getStudentById);

// @route   PUT api/students/:id
// @desc    Update a student
// @access  Private
router.put(
    '/:id',
    [
        auth,
        upload.single('image'),
        [
            check('name', 'Name is required').optional().not().isEmpty(),
            check('age', 'Age must be a number between 1 and 100').optional().isInt({ min: 1, max: 100 })
        ]
    ],
    studentController.updateStudent
);

// @route   DELETE api/students/:id
// @desc    Delete a student
// @access  Private
router.delete('/:id', auth, studentController.deleteStudent);

// @route   PATCH api/students/:id/status
// @desc    Update a student's status
// @access  Private
router.patch('/:id/status', auth, studentController.updateStudentStatus);

module.exports = router;