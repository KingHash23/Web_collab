// Updated server.js with enhanced validation

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = 3000;
const USERS_FILE = 'users.json';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper functions
function loadUsers() {
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify({}, null, 2));
        return {};
    }
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Validation functions
function validateEmail(email) {
    // Check if email starts with lowercase letter
    if (!/^[a-z]/.test(email)) {
        return { valid: false, message: 'Email must start with a lowercase letter' };
    }
    
    // Check if email contains @ symbol
    if (!email.includes('@')) {
        return { valid: false, message: 'Email must contain an @ symbol' };
    }
    
    return { valid: true };
}

function validatePassword(password) {
    // Check for at least 2 uppercase letters
    const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
    if (uppercaseCount < 2) {
        return { valid: false, message: 'Password must contain at least 2 uppercase letters' };
    }
    
    // Check for at least 2 numbers
    const numbersCount = (password.match(/[0-9]/g) || []).length;
    if (numbersCount < 2) {
        return { valid: false, message: 'Password must contain at least 2 numbers' };
    }
    
    // Check for at least 1 symbol
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) {
        return { valid: false, message: 'Password must contain at least 1 special character' };
    }
    
    return { valid: true };
}

// Routes
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
        return res.status(400).json({ success: false, message: emailValidation.message });
    }
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        return res.status(400).json({ success: false, message: passwordValidation.message });
    }
    
    const users = loadUsers();
    
    if (users[email]) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    users[email] = { name, password: hashedPassword };
    saveUsers(users);
    
    return res.status(201).json({ success: true, message: 'Registration successful' });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const users = loadUsers();
    
    if (!users[email]) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, users[email].password);
    
    if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    return res.status(200).json({ 
        success: true, 
        message: 'Login successful',
        user: {
            name: users[email].name,
            email: email
        }
    });
});

app.get('/api/user/:email', (req, res) => {
    const { email } = req.params;
    const users = loadUsers();
    
    if (!users[email]) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    return res.status(200).json({
        success: true,
        user: {
            name: users[email].name,
            email: email
        }
    });
});

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});