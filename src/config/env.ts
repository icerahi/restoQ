import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export const env = {
  node_env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN as string,
  },
  superuser: {
    email: process.env.SUPERUSER_EMAIL as string,
    password: process.env.SUPERUSER_PASSWORD as string,
  },
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS),
};
