import { users } from "../../engine/exchange_store";
import { Authschema } from "../types/auth_schema";
import { sendValidationError } from "../utils/validation";
import type { Request, RequestHandler, Response } from "express";
import bcrypt, { hashSync } from "bcrypt";
import { generatetoken } from "../utils/auth";
import { parse } from "zod";
import { prisma } from "../lib/prisma";
export async function signup(req: Request, res: Response): Promise<void> {
  const parsedData = Authschema.safeParse(req.body);
  if (!parsedData.success) {
    sendValidationError(res, parsedData.error);
    return;
  }
  const { username, password } = parsedData.data;
  try {
    const hashedpwd = await bcrypt.hash(password, 10);
    // const user = {
    //   userId: crypto.randomUUID(),
    //   username: username,
    //   password: hashedpwd,
    //   orders: [],
    //   collateral: {
    //     available: 0,
    //     locked: 0,
    //   },
    //   positions: [],
    // };
    const user =await prisma.user.create({
      data: {
        userId: crypto.randomUUID(),
        username: username,
        password: hashedpwd,
      },
    });
    res.status(201).json({
      token: generatetoken(user.userId),
      username: user.username,
      userId: user.userId,
    });
  } catch (err) {
    throw new Error("username already exists");
  }
}

export async function signin(req: Request, res: Response): Promise<void> {
  const parsedData = Authschema.safeParse(req.body);
  if (!parsedData.success) {
    sendValidationError(res, parsedData.error);
    return;
  }
  const { username, password } = parsedData.data;
  try {
   const user= await prisma.user.findFirst({
      where:{
        username:username
      }
    })
    // const user = users.filter((user) => {
    //   user.username == username;
    // })[0];
    if (!user) {
      throw new Error("username of password is incorrect");
      return ;
    }
    const plainpwd = bcrypt.compareSync(password, user.password);
    res.status(200).json({
      token: generatetoken(user.userId),
      userId: user.userId,
      usernmae: user.username,
    });
  } catch {
    throw new Error("username of password is incorrect");
  }
}
