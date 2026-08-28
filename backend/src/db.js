import mongoose from "mongoose";

let isConnecting = false;

export async function connectDB() {
  /*
  -------------------------------------------------------
  REQUIRE MONGODB_URI
  -------------------------------------------------------
  Do NOT silently fall back to localhost.
  That can cause different runs to use different databases.
  -------------------------------------------------------
  */

  const uri =
    process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not defined. Check your backend .env file."
    );
  }

  /*
  -------------------------------------------------------
  REUSE EXISTING CONNECTION
  -------------------------------------------------------
  */

  if (
    mongoose.connection.readyState === 1
  ) {
    return mongoose.connection;
  }

  if (isConnecting) {
    /*
    Wait until the current connection attempt
    completes.
    */

    await new Promise(
      (resolve, reject) => {
        const onConnected = () => {
          cleanup();
          resolve();
        };

        const onError = (error) => {
          cleanup();
          reject(error);
        };

        const cleanup = () => {
          mongoose.connection.off(
            "connected",
            onConnected
          );

          mongoose.connection.off(
            "error",
            onError
          );
        };

        mongoose.connection.once(
          "connected",
          onConnected
        );

        mongoose.connection.once(
          "error",
          onError
        );
      }
    );

    return mongoose.connection;
  }

  isConnecting = true;

  try {
    mongoose.set(
      "strictQuery",
      true
    );

    await mongoose.connect(
      uri,
      {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
      }
    );

    console.log(
      `MongoDB connected: ${mongoose.connection.name}`
    );

    console.log(
      `MongoDB host: ${mongoose.connection.host}`
    );

    return mongoose.connection;

  } finally {
    isConnecting = false;
  }
}