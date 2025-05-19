// User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Por favor adicione um nome']
    },
    email: {
        type: String,
        required: [true, 'Por favor adicione um email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Por favor adicione um email válido'
        ]
    },
    password: {
        type: String,
        required: [true, 'Por favor adicione uma senha'],
        minlength: 6,
        select: false
    },
    initials: {
        type: String
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    registrationDate: {
        type: Date,
        default: Date.now
    }
});

// Criptografar senha antes de salvar
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Gerar iniciais
    const names = this.name.split(' ');
    this.initials = names[0].charAt(0) + (names.length > 1 ? names[names.length - 1].charAt(0) : '');
});

// Gerar token JWT
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Verificar senha
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);