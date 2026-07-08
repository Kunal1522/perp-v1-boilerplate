import type { Request, Response } from "express";
import { RedisClient } from "bun";
import { orderschema } from "../../packages/shared/types/order_schema";
import { sendValidationError } from "../utils/validation";
import { env } from "../env";
import type {
  EngineReq,
  EngineResp,
  pendingPromise,
} from "../../packages/shared/types/engine";
const publisher = new RedisClient("redis://localhost:6739");
const pendingPromises = new Map<string, pendingPromise>();
const subscriber = new RedisClient("redis://localhost:6739");
export async function sendtoengine(
  enginereq: EngineReq,
  corr_id: string,
  timoutMs: string,
) {
  return new Promise((resolve, reject) => {
    const ts = setTimeout(() => {
      const pr = pendingPromises.get(corr_id);
      pr?.reject("the response timedout");
      pendingPromises.delete(corr_id);
    }, Number(timoutMs));
    const pp: pendingPromise = {
      resolve: resolve,
      reject: reject,
      timeoutMs: ts,
    };
    pendingPromises.set(corr_id, pp);
    publisher.lpush(env.incomingQueue, JSON.stringify(enginereq));
  });
}
export async function listentoengine() {
  for (;;) {
    const resp = await subscriber.brpop(env.responseQueue, 0);
    if (!resp) continue;
    const [key, element] = resp;
    const parsed = JSON.parse(element) as EngineResp;
    const corr_id = parsed.correlation_id;
    const promise = pendingPromises.get(corr_id);
    if (!promise) continue;
    clearTimeout(promise.timeoutMs);
    pendingPromises.delete(parsed.correlation_id);
    promise?.resolve(parsed);
  }
}

export async function connectRedis(): Promise<void> {
  await Promise.all([publisher.connect(), subscriber.connect()]);
}
export async function pingRedis(): Promise<string> {
  return publisher.ping();
}

export async function orderhandler(req: Request, res: Response) {
  const parsedBody = orderschema.safeParse(req.body);
  if (!parsedBody.success) {
    sendValidationError(res, parsedBody.error);
    return;
  }
  const { userId, type, side, price, qty, asset } = parsedBody.data;
  const correlation_id = crypto.randomUUID();
  const enginereq: EngineReq = {
    route: "/order",
    payload: parsedBody.data,
    correlation_id: correlation_id,
  };
  const resp = await sendtoengine(enginereq, correlation_id, env.timeoutMs);
  res.json(resp);
}
