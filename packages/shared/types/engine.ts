export interface pendingPromise {
  resolve: (value: unknown) => void;
  reject: (value: unknown) => void;
  timeoutMs: NodeJS.Timeout;
}

export interface EngineReq{
    route:string
    payload:any
    correlation_id:string,
}
export interface EngineResp{
    route:string
    resp:any,
    error:Error,
    correlation_id:string
}