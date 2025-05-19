// authController.js
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Registrar usuário
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    // Criar usuário
    const user = await User.create({
        name,
        email,
        password
    });

    // Criar token
    const token = user.getSignedJwtToken();

    ApiResponse.success(res, { token }, 201);
});

// @desc    Login do usuário
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Verificar email e senha
    if (!email || !password) {
        return next(new ApiError('Por favor forneça um email e senha', 400));
    }

    // Verificar usuário
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ApiError('Credenciais inválidas', 401));
    }

    // Verificar senha
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ApiError('Credenciais inválidas', 401));
    }

    // Criar token
    const token = user.getSignedJwtToken();

    ApiResponse.success(res, { token });
});

// @desc    Obter usuário atual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    
    ApiResponse.success(res, user);
});