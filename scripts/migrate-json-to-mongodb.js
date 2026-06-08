import { closeDatabase, getMongoConfig, importJsonDatabase, initializeDatabase } from "../server/database.js";

try {
  const { uri, dbName } = getMongoConfig();
  await initializeDatabase({ importJson: false });
  const result = await importJsonDatabase({ force: true });

  console.log(
    JSON.stringify(
      {
        ok: true,
        database: dbName,
        uri: uri.replace(/\/\/([^:/@]+):([^@]+)@/, "//***:***@"),
        ...result,
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
