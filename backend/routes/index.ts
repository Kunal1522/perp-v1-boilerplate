import { Router } from "express";
import { authrouter } from "./authrouter";
import { exchangerouter } from "./exhangerouter";

export const approuter = Router();

approuter.use(authrouter);
approuter.use(exchangerouter);
