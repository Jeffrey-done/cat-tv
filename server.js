import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './api/service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API 路由
app.use('/api', apiRouter);

// API 文档路由
app.get('/api/docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'api', 'docs.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        code: 1,
        msg: 'Internal Server Error',
        data: null
    });
});

// 处理所有其他路由
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Vercel 需要导出 app
export default app;

// 仅在非 Vercel 环境下启动服务器
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`API Documentation: http://localhost:${PORT}/api/docs`);
    });
} 