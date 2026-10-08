import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Suporte para Vercel Serverless com SQLite:
// O sistema de arquivos da Vercel em produção é somente-leitura (read-only), exceto o diretório /tmp.
// Para testes na Vercel sem banco externo, copiamos o dev.db para /tmp/dev.db para permitir escrita.
let dbUrl = process.env.DATABASE_URL || "file:./dev.db";

if (process.env.VERCEL) {
  try {
    const tmpDb = path.join("/tmp", "dev.db");
    const localDb = path.join(process.cwd(), "prisma", "dev.db");

    if (!fs.existsSync(tmpDb) && fs.existsSync(localDb)) {
      fs.copyFileSync(localDb, tmpDb);
      console.log("[Prisma Vercel] Banco inicial copiado para /tmp/dev.db com sucesso!");
    }
    dbUrl = "file:/tmp/dev.db";
    process.env.DATABASE_URL = dbUrl;
  } catch (err) {
    console.error("[Prisma Vercel] Erro ao sincronizar SQLite em /tmp:", err);
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
