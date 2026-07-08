import jwt from "jsonwebtoken";
import { env } from "../env";
import type { NextFunction, Request, Response } from "express";

export function generatetoken(payload: string) {
  return jwt.sign(payload, env.jwtsecret, { expiresIn: "3d" });
}
const getbearertokenfromheader = (authtoken: string) => {
  return authtoken.split(" ")[1];
};
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authheader = req.headers.authorization;
  if (!authheader) {
    res.status(401).json({ message: "credential error is missing" });
    return;
  }
  const token = getbearertokenfromheader(authheader);
  if (!token) {
    res.status(401).json({ message: "credential error is missing" });
    return;
  }
  const isverified = jwt.verify(env.jwtsecret, token);
  if (isverified) {
    next();
  } else {
    res.status(401).json({ message: "the user is not authenticated" });
    return;
  }
}
