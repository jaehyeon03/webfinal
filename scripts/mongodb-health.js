import { closeDatabase, getCollections, getDatabase, getMongoConfig, initializeDatabase } from "../server/database.js";

try {
  const { uri, dbName } = getMongoConfig();
  await initializeDatabase({ importJson: false });
  await getDatabase().command({ ping: 1 });

  const collections = getCollections();
  const counts = Object.fromEntries(
    await Promise.all(
      Object.entries(collections)
        .filter(([name]) => name !== "meta")
        .map(async ([name, collection]) => [name, await collection.countDocuments()]),
    ),
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        database: dbName,
        uri: uri.replace(/\/\/([^:/@]+):([^@]+)@/, "//***:***@"),
        counts,
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
