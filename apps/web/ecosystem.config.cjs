// 非 Docker 部署用的 pm2 进程定义（Web / Nuxt SSR）
// NUXT_PUBLIC_API_BASE 等变量放在服务器上的 apps/web/.env，部署脚本会先 source 再 --update-env
module.exports = {
  apps: [
    {
      name: "resume-web",
      cwd: __dirname,
      script: ".output/server/index.mjs",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOST: "0.0.0.0",
      },
      autorestart: true,
      max_restarts: 10,
    },
  ],
};