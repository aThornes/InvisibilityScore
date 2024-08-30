export const getEnvVariable = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error("Environment variable is missing or undefined: " + name);
  }

  return value;
};

export const tryGetEnvVariable = (name: string) => process.env[name] || null;
