import * as z from "zod";

export const orderschema = z.object({
  asset: z.string(),
  userId: z.string().trim(),
  qty: z.number(),
  type: z.string(),
  price: z.number().min(0),
  side:z.string()
});