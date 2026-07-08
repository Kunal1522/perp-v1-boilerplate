export const env = {
  REDIS_URL: process.env.REDIS_URL ?? "redis://localhost:6379",
  INCOMING_QUEUE: process.env.INCOMING_QUEUE ?? "backend-to-engine-broker",
  RESPONSE_QUEUE: process.env.RESPONSE_QUEUE ?? "response-queue-123",
};
