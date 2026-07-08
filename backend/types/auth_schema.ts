import * as z from "zod"; 
 
export const Authschema = z.object({ 
  username: z.string().trim().min(1,"username should be length 1 "),
  password: z.string()
});