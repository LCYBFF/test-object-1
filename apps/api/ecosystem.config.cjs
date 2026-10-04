// 非 Docker 部署用的 pm2 进程定义（API）
// 运行的是 tsdown 打包后的产物 dist/index.mjs（部署目录自带 node_modules）
// DATABASE_URL 等敏感变量放在服务器上的部署目录/.env，由 dotenv 从 cwd 加载
module.exports = {
  apps: [
    {
      name: "resume-api",
      cwd: __dirname,
      script: "dist/index.mjs",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
        HOST: "0.0.0.0",
      },
      autorestart: true,
      max_restarts: 10,
    },
  ],
};