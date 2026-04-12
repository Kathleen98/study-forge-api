import z from "zod";
import 'dotenv/config';

export const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "test", "production"]).default("dev"),
  PORT: z.coerce.number().default(3333),
  CLERK_SECRET_KEY: z.string()
})

const _env = envSchema.safeParse(process.env)

if(_env.success === false){
  console.error('Invalid environment variables', _env.error)
  throw new Error('Invalid environment variables')
}

export const env = _env.data