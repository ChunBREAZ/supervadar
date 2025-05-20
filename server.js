const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors'); // 引入 cors 中间件
const app = express();
const port = 3000;  // Node.js 服务器端口

// 数据库连接配置（MySQL 端口保持 3306）
const pool = mysql.createPool({
    host: 'supervadar-db.c2zssa8mopj7.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: '12345678',
    database: 'academic_db',
    port: 3306,  // MySQL 端口
});

// 测试数据库连接
pool.getConnection()
    .then(connection => {
        console.log('数据库连接成功');
        connection.release();
    })
    .catch(err => {
        console.error('数据库连接失败:', err);
        process.exit(1);
    });

// 使用 cors 中间件
app.use(cors());

// 解析 JSON 请求体
app.use(express.json());

// API 路由
app.get('/api/data', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM supervadar');
        res.json(rows);
    } catch (error) {
        console.error('查询数据失败:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 根路径响应
app.get('/', (req, res) => {
    res.send('服务器正常运行中，请访问 /api/data 获取数据');
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器运行在端口 ${port}`);
});
