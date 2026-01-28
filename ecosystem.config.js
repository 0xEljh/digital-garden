module.exports = {
  apps: [
    {
      name: "digital-garden",
      script: "node_modules/.bin/next",
      args: "start -p 3005",
      interpreter: "bun",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
