const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { validationResult } = require('express-validator');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { 
            user: { 
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role || 'user'
            } 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
exports.register = async (req, res) => {
    console.log('Registration attempt with data:', {
        username: req.body.username,
        email: req.body.email,
        passwordProvided: !!req.body.password
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { username, email, password } = req.body;

    try {
        // Check if user exists by email
        let emailUser = await User.findOne({ email });
        if (emailUser) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        // Check if username exists
        let usernameUser = await User.findOne({ username });
        if (usernameUser) {
            return res.status(400).json({ error: 'Username is already taken' });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password
        });

        await user.save();
        console.log('New user created:', user._id);

        // Generate token
        const token = generateToken(user);

        // Return user info along with token (using _id to match MongoDB)
        res.json({ 
            token,
            user: {
                _id: user._id,
                id: user._id, // Include both for compatibility
                username: user.username,
                email: user.email,
                role: user.role || 'user'
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // For Google accounts without password
        if (user.googleId && !user.password) {
            return res.status(400).json({ 
                error: 'This account was created with Google. Please use Google login.' 
            });
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user);

        // Return user info along with token
        res.json({ 
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role || 'user'
            }
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// @route   POST api/auth/google
// @desc    Login or Register with Google OAuth
// @access  Public
exports.googleAuth = async (req, res) => {
    const { tokenId } = req.body;

    try {
        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { email_verified, name, email, sub: googleId } = ticket.getPayload();

        // Check if email is verified
        if (!email_verified) {
            return res.status(400).json({ error: 'Google email not verified' });
        }

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user with Google login info
            user = new User({
                username: name.replace(/\s/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
                email,
                googleId
            });

            await user.save();
        } else if (!user.googleId) {
            // Update existing user with Google ID
            user.googleId = googleId;
            await user.save();
        }

        // Generate token
        const token = generateToken(user);

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET api/auth/user
// @desc    Get current user info
// @access  Private
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET api/auth/debug-token
// @desc    Debug route to check JWT functionality (REMOVE IN PRODUCTION)
// @access  Public
exports.debugToken = async (req, res) => {
  try {
    // Create a test payload
    const payload = {
      user: {
        id: 'test-id',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user'
      }
    };
    
    // Sign the token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({
      success: true,
      message: 'JWT secret is working correctly',
      token: token,
      decoded: decoded,
      secretFirstChars: process.env.JWT_SECRET.substring(0, 5) + '...'
    });
  } catch (err) {
    console.error('JWT Error:', err);
    res.status(500).json({ 
      error: 'JWT verification failed',
      message: err.message
    });
  }
};