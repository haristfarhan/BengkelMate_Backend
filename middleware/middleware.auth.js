import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Ambil token dari header
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifikasi token
    const user = await User.findById(decoded.id); // Cari user berdasarkan ID di token

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // Simpan user ke request object
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized', error });
  }
};
