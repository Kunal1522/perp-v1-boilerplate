import express from "express";
import { approuter } from "./routes";
import { env } from "./env";

const app = express();
app.use(express.json());
app.use(approuter);
//
// app.post("/signin", (req, res) => {})---done
// app.post("/signup", (req, res) => {})---done
app.post("/onramp", (req, res) => {});
app.post("/order", (req, res) => {});
app.delete("/order", (req, res) => {});
app.get("/equity/available", (req, res) => {});
app.get("/positions/open/:marketId", (req, res) => {});
app.get("/positions/closed/:marketId", (req, res) => {});
app.get("/orders/open/:marketId", (req, res) => {});
app.get("/orders/:marketId", (req, res) => {});
app.get("/fills", (req, res) => {});

app.listen(env.port, () => {
  console.log(`server is running on port ${env.port}`);
});

