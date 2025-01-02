import { Router } from 'express';
const router = Router();
import { hash, compare } from 'bcrypt';
// import { sign } from 'jsonwebtoken';

import pkg from 'jsonwebtoken';
const {sign} = pkg ;

import User from '../models/user.js'

// // Model dinamis untuk koleksi user
// import createUserModel from './models/usersModels.js';
// const User = createUserModel('users');

// Register
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already registered' });
        }

        const hashedPassword = await hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, role });
        await newUser.save(); 

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isMatch = await compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});

export default router;
