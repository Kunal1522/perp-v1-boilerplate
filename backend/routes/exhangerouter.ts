import { Router } from "express";
import { asynchandler } from "../utils/aynchandler";
import { onramp } from "../controllers/exchange_controller";

export const exchangerouter = Router();
exchangerouter.post("/onramp", asynchandler(onramp));
exchangerouter.post("/order",asynchandler(orderhandler));
