const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const connectToDatabase = require("./dbConnection")[process.env.NODE_ENV];

const createSequelizeInstance = async () => {
  // Check if required environment variables are set
  if (
    !process.env.DB_NAME ||
    !process.env.DB_USER ||
    !process.env.DB_PASSWORD ||
    !process.env.DB_HOST ||
    !process.env.DB_DIALECT
  ) {
    throw new Error("Database configuration is missing environment variables.");
  }

  // Log the database configuration
  console.log("Database Configuration:", {
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  });

  const pool = await connectToDatabase(); // Get the MySQL connection pool

  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      dialect: process.env.DB_DIALECT, // Use the database dialect from environment variables
      dialectModule: require("mysql2"), // Ensure mysql2 is used for MySQL connections
      pool: {
        max: 10, // Maximum number of connections
        min: 0, // Minimum number of connections
        acquire: 30000, // Maximum time (in milliseconds) Sequelize will try to get a connection before throwing an error
        idle: 10000, // Maximum time (in milliseconds) a connection can be idle before being released
      },
      host: process.env.DB_HOST,
      logging: false, // Set to true to see SQL queries in the console
    }
  );

  // Test the connection
  try {
    await sequelize.authenticate();
    console.log("Sequelize connected to the database.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  return sequelize;
};

module.exports = createSequelizeInstance;
