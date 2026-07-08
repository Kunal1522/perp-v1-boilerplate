import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { RedisClient } from "bun";
export async function onramp(req: Request, res: Response) {
  const { username, balance } = req.body;
  const user = await prisma.user.findFirst({
    where: {
      username: username,
    },
  });
  const userId = user?.userId;
  if (!user) {
    throw new Error("user does not exsist");
  }
  try {
    const coll = await prisma.collateral.update({
      where: {
        id: userId,
      },
      data: {
        available: {
          increment: balance,
        },
      },
    });
    // user.collateral.available += balance;
    res.status(201).json(coll);
  } catch {
    throw new Error("some error on ramp fns");
  }
}


