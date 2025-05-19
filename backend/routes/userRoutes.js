const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');

// Obter dados do usuário atual
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId)
            .select('-password -resetPasswordToken -resetPasswordExpires');
        
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
});

// Atualizar perfil do usuário
router.put('/', authMiddleware, async (req, res) => {
    try {
        const { name, email } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.session.userId,
            { name, email },
            { new: true, runValidators: true }
        ).select('-password -resetPasswordToken -resetPasswordExpires');

        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;