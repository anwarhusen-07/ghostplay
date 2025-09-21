require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 3000;

// In-memory OTP storage (use a database or Redis in production)
const otpStore = new Map();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..'))); // Serve static files from root directory

// Load environment variables
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ghostplay')
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('Database connection error:', err));

// User schema and model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    loginHistory: [{
        loginTime: { type: Date },
        logoutTime: { type: Date }
    }],
    badges: [{ type: String }],
    lastLogin: { type: Date },
    scores: {
        simple: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        hard: { type: Number, default: 0 }
    }
});

// Contact schema and model
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String, required: true },
    messageType: { type: String, required: true },
    feedback: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Contact = mongoose.model('Contact', contactSchema);

// Function to generate OTP
function generateOtp() {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP as string
}

// Function to send OTP via email
async function sendOtpEmail(email, otp) {
    const mailOptions = {
        from: emailUser,
        to: email,
        subject: 'Your OTP Code for GhostPlay',
        text: `Your OTP for GhostPlay is: ${otp}. Please enter this code to proceed.`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('OTP sent:', info.response);
        return true;
    } catch (err) {
        console.error('Error sending email:', err);
        return false;
    }
}

// Route to handle user sign-up
app.post('/signup', async (req, res) => {
    const { username, password, email, otp } = req.body;

    console.log('Signup request received:', { username, email, otp, otpType: typeof otp }); // Debug log

    try {
        // Verify OTP
        const storedOtp = otpStore.get(email);
        console.log('Stored OTP:', storedOtp, 'Provided OTP:', otp); // Debug OTP comparison
        if (!storedOtp) {
            console.log('No OTP found for email:', email);
            return res.status(400).json({ message: 'No OTP found for this email. Request a new OTP.' });
        }
        if (storedOtp !== String(otp)) {
            console.log('OTP mismatch:', { storedOtp, providedOtp: otp });
            return res.status(400).json({ message: 'Invalid OTP. Please check the code and try again.' });
        }

        // Clear OTP after verification
        otpStore.delete(email);
        console.log('OTP cleared for email:', email);

        // Check for existing user by username or email
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            console.log('User already exists:', { username, email });
            return res.status(400).json({
                message: existingUser.username === username
                    ? 'Username already exists!'
                    : 'Email already exists!'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            loginHistory: [],
            badges: [],
            lastLogin: null,
            scores: { simple: 0, medium: 0, hard: 0 }
        });

        await newUser.save();
        console.log('User created successfully:', username);
        res.status(201).json({ message: 'User created successfully. Please log in.' });
    } catch (error) {
        console.error('Signup error details:', error); // Detailed error logging
        if (error.code === 11000) { // MongoDB duplicate key error
            return res.status(400).json({
                message: error.keyValue.username
                    ? 'Username already exists!'
                    : 'Email already exists!'
            });
        }
        res.status(500).json({ message: 'An error occurred during sign up. Please try again later.' });
    }
});

// Route to handle OTP request
app.post('/request-otp', async (req, res) => {
    console.log('Received request to /request-otp');
    const { email } = req.body;
    console.log('Request body:', req.body);

    if (!email) {
        console.log('Error: Email is missing');
        return res.status(400).json({ message: 'Email is required' });
    }

    const otp = generateOtp();
    console.log(`Generated OTP for ${email}: ${otp}`);

    // Store OTP with email as key (expires in 5 minutes)
    otpStore.set(email, otp);
    console.log(`Stored OTP for ${email} in otpStore`);
    setTimeout(() => {
        console.log(`Expired OTP for ${email}`);
        otpStore.delete(email);
    }, 5 * 60 * 1000);

    const emailSent = await sendOtpEmail(email, otp);
    if (emailSent) {
        console.log(`Successfully sent OTP to ${email}`);
        res.status(200).json({ message: 'OTP sent successfully to your email!' });
    } else {
        console.log(`Failed to send OTP to ${email}`);
        res.status(500).json({ message: 'Failed to send OTP. Please try again later.' });
    }
});

// Route to handle login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Incorrect username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            user.loginHistory.push({ loginTime: new Date() });
            user.lastLogin = new Date();
            await user.save();
            res.status(200).json({
                message: 'Login successful',
                userId: user._id
            });
        } else {
            res.status(400).json({ message: 'Incorrect username or password' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'An error occurred during login. Please try again later.' });
    }
});

// Route to handle logout
app.post('/logout', async (req, res) => {
    const { userId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const lastLogin = user.loginHistory[user.loginHistory.length - 1];
        if (lastLogin && !lastLogin.logoutTime) {
            lastLogin.logoutTime = new Date();
            await user.save();
        }

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ message: 'An error occurred during logout. Please try again later.' });
    }
});

// Route to save user progress (badges)
app.post('/save-user-progress', async (req, res) => {
    const { userId, badges } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        badges.forEach(badge => {
            if (!user.badges.includes(badge)) {
                user.badges.push(badge);
            }
        });

        await user.save();
        res.status(200).json({ message: 'User progress saved successfully' });
    } catch (error) {
        console.error('Error saving user progress:', error);
        res.status(500).json({ message: 'An error occurred while saving progress. Please try again later.' });
    }
});

// Route to save user score
app.post('/save-user-score', async (req, res) => {
    const { userId, level, score } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Update the score for the specified level if the new score is higher
        if (user.scores[level] < score) {
            user.scores[level] = score;
            await user.save();
        }

        res.status(200).json({ message: 'User score saved successfully' });
    } catch (error) {
        console.error('Error saving user score:', error);
        res.status(500).json({ message: 'An error occurred while saving score. Please try again later.' });
    }
});

// Route to get user progress
app.get('/get-user-progress', async (req, res) => {
    const { userId } = req.query;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        res.status(200).json({
            badges: user.badges,
            scores: user.scores
        });
    } catch (error) {
        console.error('Error fetching user progress:', error);
        res.status(500).json({ message: 'An error occurred while fetching progress.' });
    }
});

// Route to handle contact form submission
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, contactNumber, messageType, feedback } = req.body;
        const contact = new Contact({
            name,
            email,
            contactNumber,
            messageType,
            feedback
        });
        await contact.save();
        res.status(201).json({ message: 'Contact form submitted successfully' });
    } catch (error) {
        console.error('Error saving contact form:', error);
        res.status(500).json({ message: 'Failed to submit form', error: error.message });
    }
});

// Serve contact page
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'contact.html'));
});

// Serve quiz page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});