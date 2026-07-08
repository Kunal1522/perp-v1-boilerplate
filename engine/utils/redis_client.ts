import { RedisClient } from "bun";
import { env } from "./env";
import { isConstructSignatureDeclaration } from "typescript";
import type { EngineReq, EngineResp } from "../../packages/shared/types/engine";

const subscriber = new RedisClient(env.REDIS_URL);
const publisher = new RedisClient(env.REDIS_URL);
export async function connecttoredis() {
  await Promise.all([subscriber.connect(), publisher.connect()]);
}
export async function listentobackend() {
  while (true) {
    const resp = await subscriber.brpop(env.INCOMING_QUEUE, 0); // ← add the 0
    if (!resp) continue;
    const [key, element] = resp;
    const parsed = JSON.parse(element);
    try {
      //await call order controller 
    //get response from controller /
      
    }
    catch(err){
     
    }
  }
}



export async function sendtoabckend(res:EngineResp){
   
}