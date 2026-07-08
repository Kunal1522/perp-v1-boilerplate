import { Router } from "express";
import { asynchandler } from "../utils/aynchandler";
import { signin, signup } from "../controllers/auth_controllers";
export const authrouter = Router();
authrouter.post("/signup", asynchandler(signup));
authrouter.post("/signin", asynchandler(signin));
