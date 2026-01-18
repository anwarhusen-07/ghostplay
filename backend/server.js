require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;  // Works locally & on Vercel

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..'))); // Serve static files from root

// Load environment variables
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: emailUser, pass: emailPass },
});

// ------------------ MongoDB Connection ------------------
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Database connection error:', err));

// ------------------ Schemas & Models ------------------

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    loginHistory: [{ loginTime: Date, logoutTime: Date }],
    badges: [String],
    lastLogin: Date,
    scores: { simple: { type: Number, default: 0 }, medium: { type: Number, default: 0 }, hard: { type: Number, default: 0 } }
});
const User = mongoose.model('User', userSchema);

// OTP Schema
const otpSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } // expires after 5 mins
});
const OTP = mongoose.model('OTP', otpSchema);

// Contact Schema
const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    contactNumber: String,
    messageType: String,
    feedback: String,
    createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// ------------------ Helper Functions ------------------
function generateOtp() { return Math.floor(1000 + Math.random() * 9000).toString(); }

async function sendOtpEmail(email, otp) {
    try {
        const info = await transporter.sendMail({
            from: emailUser,
            to: email,
            subject: 'Your OTP Code for GhostPlay',
            text: `Your OTP for GhostPlay is: ${otp}. Please enter this code to proceed.`
        });
        console.log('OTP sent:', info.response);
        return true;
    } catch (err) {
        console.error('Error sending email:', err);
        return false;
    }
}

// ------------------ Routes ------------------

// Request OTP
app.post('/request-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const otp = generateOtp();
    try {
        await OTP.findOneAndUpdate(
            { email },
            { otp, createdAt: new Date() },
            { upsert: true }
        );

        const sent = await sendOtpEmail(email, otp);
        if (sent) return res.status(200).json({ message: 'OTP sent successfully!' });
        else return res.status(500).json({ message: 'Failed to send OTP. Try again.' });
    } catch (err) {
        console.error('OTP error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Signup
app.post('/signup', async (req, res) => {
    const { username, password, email, otp } = req.body;
    try {
        const record = await OTP.findOne({ email });
        if (!record) return res.status(400).json({ message: 'No OTP found. Request a new one.' });
        if (record.otp !== String(otp)) return res.status(400).json({ message: 'Invalid OTP' });

        await OTP.deleteOne({ email });

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({
                message: existingUser.username === username ? 'Username already exists!' : 'Email already exists!'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, email, loginHistory: [], badges: [], lastLogin: null });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully. Please log in.' });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ message: 'Server error during signup' });
    }
});

// Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Incorrect username or password' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: 'Incorrect username or password' });

        user.loginHistory.push({ loginTime: new Date() });
        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({ message: 'Login successful', userId: user._id });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Logout
app.post('/logout', async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ message: 'User not found' });

        const lastLogin = user.loginHistory[user.loginHistory.length - 1];
        if (lastLogin && !lastLogin.logoutTime) lastLogin.logoutTime = new Date();
        await user.save();

        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ message: 'Server error during logout' });
    }
});

// Save user progress
app.post('/save-user-progress', async (req, res) => {
    const { userId, badges } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ message: 'User not found' });

        badges.forEach(b => { if (!user.badges.includes(b)) user.badges.push(b); });
        await user.save();
        res.status(200).json({ message: 'Progress saved successfully' });
    } catch (err) {
        console.error('Progress error:', err);
        res.status(500).json({ message: 'Server error while saving progress' });
    }
});

// Save user score
app.post('/save-user-score', async (req, res) => {
    const { userId, level, score } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ message: 'User not found' });

        if (user.scores[level] < score) user.scores[level] = score;
        await user.save();
        res.status(200).json({ message: 'Score saved successfully' });
    } catch (err) {
        console.error('Score error:', err);
        res.status(500).json({ message: 'Server error while saving score' });
    }
});

// Get user progress
app.get('/get-user-progress', async (req, res) => {
    const { userId } = req.query;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ message: 'User not found' });

        res.status(200).json({ badges: user.badges, scores: user.scores });
    } catch (err) {
        console.error('Get progress error:', err);
        res.status(500).json({ message: 'Server error while fetching progress' });
    }
});

// Contact form
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, contactNumber, messageType, feedback } = req.body;
        const contact = new Contact({ name, email, contactNumber, messageType, feedback });
        await contact.save();
        res.status(201).json({ message: 'Contact form submitted successfully' });
    } catch (err) {
        console.error('Contact error:', err);
        res.status(500).json({ message: 'Server error while submitting form' });
    }
});

// Serve pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'index.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, '..', 'contact.html')));

// ------------------ Start Server ------------------
// ------------------ Start Server ------------------
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
