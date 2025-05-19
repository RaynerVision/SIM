// PasswordReset.js
const mongoose = require('mongoose');

const PasswordResetSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 3600 // 1 hora para expirar
    }
});

module.exports = mongoose.model('PasswordReset', PasswordResetSchema);