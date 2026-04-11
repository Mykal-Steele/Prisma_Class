import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../generated/prisma/client.js";
import "dotenv/config";
const connectionString = process.env.DATABASE_URL || "file:./dev.db";

const adapter = new PrismaLibSql({ url: connectionString });
const prisma = new PrismaClient({ adapter });

export default prisma;
