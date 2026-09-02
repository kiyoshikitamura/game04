export type AppEnvironment = "development" | "preview" | "production";

const validEnvironments: readonly AppEnvironment[] = ["development", "preview", "production"];

export function appEnvironment(): AppEnvironment {
  const value = process.env.NEXT_PUBLIC_APP_ENV;
  return validEnvironments.includes(value as AppEnvironment) ? value as AppEnvironment : "development";
}

export function isProduction(): boolean {
  return appEnvironment() === "production";
}
