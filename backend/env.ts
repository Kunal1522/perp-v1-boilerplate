// import "dontenv/config";
function getenv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`env ${name} is missing`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? "3000"),
  jwtsecret: getenv("JWT_SECRET"),
  timeoutMs: getenv("timeoutMs"),
  incomingQueue: "backend-to-engine-broker", // backend writes here
  responseQueue: `response-queue-${crypto.randomUUID()}`, // backend reads here
};
