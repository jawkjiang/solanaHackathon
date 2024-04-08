const express = require('express');
const path = require('path');

const app = express();

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// 启动服务器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
