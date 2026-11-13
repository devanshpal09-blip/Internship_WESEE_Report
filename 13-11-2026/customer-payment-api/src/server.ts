import "dotenv/config";

import { buildApp } from "./app.js";

const startServer = async () => {
  const app = buildApp();

  try {
    const port = Number(process.env.PORT || 3000);

    await app.listen({
      port,
      host: "127.0.0.1"
    });

  } catch (error) {
    app.log.error(error);
    process.exitCode = 1;
  }
};

startServer();