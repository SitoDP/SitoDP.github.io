/**
 * Runtime helpers for accessing import.meta.env values.
 * Use `requireEnv` for required values (throws if missing).
 * Use `optionalEnv` for optional values (returns undefined if missing).
 */

const env = import.meta.env as Record<string, string | undefined>

export function requireEnv(name: string): string {
  const value = env[name]
  if (!value) {
    throw new Error(
      `Missing required env var ${name}. ` +
        `Add it to your .env file (see .env.example for the expected variables).`,
    )
  }
  return value
}

export function optionalEnv(name: string): string | undefined {
  return env[name]
}
