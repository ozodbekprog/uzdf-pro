import "dotenv/config";
import { z } from "zod";

const DEV_SECRET = "dev-secret-change-me";

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    HOST: z.string().default("0.0.0.0"),
    DATABASE_URL: z
      .string()
      .default("postgresql://postgres@127.0.0.1:55432/uzdfpro?schema=public"),
    JWT_SECRET: z.string().min(8).default(DEV_SECRET),
    ACCESS_TOKEN_TTL: z.string().default("15m"),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
    CORS_ORIGIN: z.string().default("http://localhost:3000")
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV === "production" && value.JWT_SECRET === DEV_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "JWT_SECRET production muhitida majburiy va dev qiymatdan farqli bo'lishi kerak",
        path: ["JWT_SECRET"]
      });
    }
  });

export const env = schema.parse(process.env);
export type Env = typeof env;
