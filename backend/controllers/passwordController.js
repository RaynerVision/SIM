// passwordController.js
const crypto = require('crypto');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../middlewares/asyncHandler');
const sendEmail = require('../services/emailService');

// @desc    Solicitar reset de senha
// @route   POST /api/password/forgot
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        // Não revelar que o email não existe por questões de segurança
        return ApiResponse.success(res, { message: 'Se o email existir, você receberá um código de recuperação' });
    }

    // Gerar código de 6 dígitos
    const resetCode = crypto.randomInt(100000, 999999).toString();

    // Criar registro de reset
    await PasswordReset.create({
        email: user.email,
        token: resetCode
    });

    // Enviar email
    try {
        await sendEmail({
            email: user.email,
            subject: 'Seu código de recuperação de senha',
            message: `Seu código de recuperação é: ${resetCode}`
        });

        ApiResponse.success(res, { message: 'Código enviado para o email' });
    } catch (err) {
        await PasswordReset.deleteOne({ email: user.email });
        return next(new ApiError('Erro ao enviar email', 500));
    }
});

// @desc    Resetar senha
// @route   PUT /api/password/reset
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    const { email, code, newPassword } = req.body;

    // Verificar código
    const resetEntry = await PasswordReset.findOne({
        email,
        token: code
    });

    if (!resetEntry) {
        return next(new ApiError('Código inválido ou expirado', 400));
    }

    // Encontrar usuário
    const user = await User.findOne({ email });

    if (!user) {
        return next(new ApiError('Usuário não encontrado', 404));
    }

    // Atualizar senha
    user.password = newPassword;
    await user.save();

    // Deletar código
    await PasswordReset.deleteOne({ email });

    ApiResponse.success(res, { message: 'Senha redefinida com sucesso' });
});