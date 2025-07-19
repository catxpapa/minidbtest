const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../web')));

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'MiniDB测试应用后端服务运行正常',
        timestamp: new Date().toISOString()
    });
});

// 启动服务器
app.listen(port, () => {
    console.log(`MiniDB 测试应用后端服务启动成功，端口: ${port}`);
    console.log('提供静态文件服务，minidb 在前端运行');
});