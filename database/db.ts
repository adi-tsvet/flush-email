import sql from "mssql";

const dbConfig = {
  user: process.env.MSSQL_USER!,
  password: process.env.MSSQL_PASSWORD!,
  server: process.env.MSSQL_SERVER!,
  database: process.env.MSSQL_DATABASE!,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  port: parseInt(process.env.MSSQL_PORT || "1433"),
  connectTimeout: 30000, // 30 seconds
  requestTimeout: 30000, // 30 seconds
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log("Connected to MSSQL Database!");
    return pool;
  })
  .catch((err) => {
    console.error("Database Connection Failed: ", err);
    throw err;
  });

export default poolPromise;
