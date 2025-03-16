const Student = require('../models/Student');
const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');

// @route   POST api/students
// @desc    Create a new student
// @access  Private
exports.createStudent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If there's an uploaded file, delete it
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, age, status } = req.body;

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload an image' });
        }

        // Create new student
        const student = new Student({
            name,
            age: parseInt(age),
            status: status || 'Active',
            image: `/uploads/${req.file.filename}`
        });

        await student.save();
        res.status(201).json(student);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET api/students
// @desc    Get all students
// @access  Private
exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.json(students);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET api/students/:id
// @desc    Get a student by ID
// @access  Private
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json(student);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.status(500).send('Server error');
    }
};

// @route   PUT api/students/:id
// @desc    Update a student
// @access  Private
exports.updateStudent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If there's an uploaded file, delete it
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, age, status } = req.body;

        // Find student by ID
        let student = await Student.findById(req.params.id);

        if (!student) {
            // If there's an uploaded file, delete it
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            }
            return res.status(404).json({ error: 'Student not found' });
        }

        // Update fields
        student.name = name || student.name;
        student.age = age ? parseInt(age) : student.age;
        student.status = status || student.status;

        // If a new image was uploaded
        if (req.file) {
            // Delete old image if it exists
            if (student.image) {
                const oldImagePath = path.join(__dirname, '..', student.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error('Error deleting old image:', err);
                    });
                }
            }

            // Update image path
            student.image = `/uploads/${req.file.filename}`;
        }

        await student.save();
        res.json(student);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.status(500).send('Server error');
    }
};

// @route   DELETE api/students/:id
// @desc    Delete a student
// @access  Private
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Delete student's image if it exists
        if (student.image) {
            const imagePath = path.join(__dirname, '..', student.image);
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) console.error('Error deleting image:', err);
                });
            }
        }

        await student.deleteOne();
        res.json({ message: 'Student removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.status(500).send('Server error');
    }
};

// @route   PATCH api/students/:id/status
// @desc    Update a student's status
// @access  Private
exports.updateStudentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['Active', 'Inactive'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        student.status = status;
        await student.save();

        res.json(student);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.status(500).send('Server error');
    }
};