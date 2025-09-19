const express = require('express')
const router = express.Router();
const User = require('./../models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt')

router.post('/signup', async (req, res) => {
    try {
        const data = req.body;
        if (data.role === 'admin') {
            const existingAdmin = await User.findOne({ role: 'admin' });
            if (existingAdmin) {
                return res.status(400).json({ error: 'Only one admin is allowed in the system' });
            }
        }
        const newUser = new User(data);
        const response = await newUser.save();
        console.log('data saved')
        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is ", token);
        res.status(200).json({ response: response, token: token })
    } catch (err) {
        console.log('Error saving user', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { aadharCardNumber, password } = req.body;
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber })

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid username and password' });
        }

        const payload = {
            id: user.id
        }
        const token = generateToken(payload);
        res.status(200).json({ token })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId)
        res.status(200).json({ user })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(userId);

        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid current password ' })
        }

        user.password = newPassword;
        await user.save();

        console.log('password updated')
        res.status(200).json({ message: 'Password updated' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error ' })
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
})
module.exports = router;