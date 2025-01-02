// const mongoose = require('mongoose');
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, uniqe: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['admin', 'customer', 'SA', 'sparepart', 'satpam', 'mekanik'], 
        required: true 
    },
}, { timestamps: true });


const User = mongoose.model('User', userSchema);

export default User;