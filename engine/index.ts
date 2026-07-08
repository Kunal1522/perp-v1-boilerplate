import { orderbooks, users } from "./exchange_store";

function build_url(baseurl: string) {
  const stream = "markPrice"; // or "aggTrade" / "ticker"
  Object.keys(orderbooks).forEach((stock) => {
    baseurl += stock.toLowerCase() + "@" + stream;
    if (Object.keys(orderbooks).length > 1) {
      baseurl += "/";
    }
  });
  return baseurl;
}
function liqudationChecks() {
  console.log("HI");
  users.forEach((user) => {
    for (const pos of user.positions) {
           
    }
  });
}

async function onPriceUpdateFromBinance(asset: string, price: number) {
  // liqudationChecks(asset, price);
  let index_price = 0;
  const stream = "markPrice"; // or "aggTrade" / "ticker"
  const baseurl = `wss://fstream.binance.com/market/stream?streams=`;
  const streamurl = build_url(baseurl);
  console.log(streamurl);
  const socket = new WebSocket(streamurl);
  let liqprice: number = 0;

  socket.addEventListener("open", () => {
    console.log("connection is started ");
  });
  socket.addEventListener("message", (event) => {
    const raw = JSON.parse(event.data as string);
    let symbol: string = raw.stream.split("@")[0];
    const data = raw.data;
    index_price = data.p;
    symbol = symbol.toUpperCase();
    let ob = orderbooks[symbol];
    ob ??= { bids: {}, asks: {}, indexPrice: 0, lastTradedPrice: 0 };
    ob.indexPrice = index_price;
    console.log("price:", index_price, symbol);
  });
  socket.addEventListener("error", (err) => {
    console.log("error:", err);
  });
  socket.addEventListener("close", (event) => {
    console.log("closed:", event.code, event.reason);
  });
}

setInterval(() => {
  liqudationChecks();
}, 2000);
// liqudationChecks("btcusdt", 0);
