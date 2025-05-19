require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./src/routes/authRoutes');
const passwordRoutes = require('./src/routes/passwordRoutes');
const userRoutes = require('./src/routes/userRoutes'); // Novo
const session = require('express-session'); // Novo
const MongoStore = require('connect-mongo'); // Novo
const errorMiddleware = require('./src/middlewares/errorMiddleware');
const multer = require('multer'); // Novo
const path = require('path'); // Novo
const fs = require('fs'); // Novo

const app = express();

// Configuração do Multer para upload de avatar
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public/uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Apenas imagens são permitidas!'), false);
    }
});

// Middlewares básicos
app.use(helmet());
app.use(cors({
    origin: 'https://cryptovision.com.br',  // Seu domínio fixo aqui
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração de sessão com armazenamento no MongoDB
app.use(session({
    secret: process.env.SESSION_SECRET || 'seu_segredo_super_secreto',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60 // 1 dia em segundos
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true em produção para HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 dia em milissegundos
    }
}));

// Limite de requisições para segurança
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100
});
app.use(limiter);

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com o banco de dados
require('./src/config/database');

// Rotas da aplicação
app.use('/api/auth', authRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/user', userRoutes); // Novo

// Rota para upload de avatar
app.post('/api/upload-avatar', upload.single('avatar'), (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Não autorizado' });
    }
    
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const avatarUrl = '/uploads/' + req.file.filename;
    // Atualize o usuário no banco com a nova URL do avatar aqui, se quiser
    res.json({ avatarUrl });
});

// Rotas SPA - serve o frontend para qualquer rota não tratada pela API
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware para tratamento de erros
app.use(errorMiddleware);

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
