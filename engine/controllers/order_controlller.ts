import type { Request, Response } from "express";
import { orderschema } from "../../packages/shared/types/order_schema";
import { sendValidationError } from "../../backend/utils/validation";
import {
  orderbooks,
  users,
  type Bid,
  type fillsinterface,
  type Position,
  type UserInterface,
} from "../exchange_store";


/**
 * 
 * @param quote 
 * @param type 
 * @returns 
 *              * type Orderbooks = {
    [x: string]: {
        bids: {
            [x: string]: Bid;
        };
        asks: {
            [x: string]: Bid;
        };
        lastTradedPrice: number;
        indexPrice: number;
    };

  
}
 */
/*export type Bid = {
  availableQty: number;
  openOrders: {
    userId: number;
    qty: number;
    filledQty: number;
    orderId: number;
    createdAt: Date;
  }[];
};
export type Orderbook = {z
  bids: Record<string, Bid>;
  asks: Record<string, Bid>;
  lastTradedPrice: number;
  indexPrice: number;
};
export type Orderbooks = Record<string, Orderbook>;

export const orderbooks: Orderbooks = {
  SOL: { bids: {}, asks: {}, lastTradedPrice: 90, indexPrice: 90.01 },
  ETH: { bids: {}, asks: {}, lastTradedPrice: 1900, indexPrice: 1899.9 },
};*/

export function isincreasingposn(quote: string, type: string) {
  return (
    (quote === "bids" && type === "LONG") ||
    (quote === "asks" && type === "SHORT")
  );
}
export function get_valid_price(quote:'asks'| 'bids',resting_orders:Record<string,Bid>,price:number){
  let valid_price;
  if(quote==='bids'){
  valid_price = Object.keys(resting_orders).filter((priceit) => {
      Number(priceit) <= price && Number(priceit) !== 0;
    });
    valid_price.sort((a, b) => Number(a) - Number(b));
  }
  else {
    valid_price = Object.keys(resting_orders).filter((priceit) => {
      Number(priceit) >= price && Number(priceit) !== 0;
    });
    valid_price.sort((a, b) => Number(b) - Number(a));
  }
  return valid_price;
}
//average price represnets the cost at which i entered the marked
//pnl involved the calculatio
export function updatepnlandavgprice(
  user: UserInterface,
  posn: Position,
  quote: string,
  trading_price: number,
  traded_qty: number,
) {
  //avg price is not affected when we are closing the posn
  //because it represnts the price at which we entered the market
  //this means if we sold 3 btc out of 10 btc at higher price
  //event then the entry price of those remaining 7 btc will
  //remain same
  const newqty = traded_qty,
    oldqty = posn.qty;
  if (isincreasingposn(quote, posn.type)) {
    posn.averagePrice =
      (oldqty * posn.averagePrice + newqty * trading_price) / (oldqty + newqty);
  }
  if (posn.type === "LONG") {
    posn.pnl = traded_qty * (trading_price - posn.averagePrice);
  } else if (posn.type === "SHORT") {
    posn.pnl = traded_qty * (posn.averagePrice - trading_price);
  }
}
//this should be used at last so it does not affect other posn
export function updateqty(posn: Position, quote: string, tradedqty: number) {
  if (posn.type === "LONG" && quote === "asks") {
    posn.qty -= tradedqty;
     
  } else if (posn.type === "LONG" && quote === "bids") {
    posn.qty += tradedqty;
  } else if (posn.type === "SHORT" && quote === "asks") {
    posn.qty += tradedqty;
  } else if (posn.type === "SHORT" && quote === "bids") {
    posn.qty -= tradedqty;
  }
  if (posn.qty === 0) {
    posn.averagePrice = 0;
    posn.pnl = 0;
  }
}
export function updatebalance(
  user: UserInterface,
  posn: Position,
  qty: number,
  quote: string,
  totprice: number,
) {
  let collatral = user.collateral;
  if (posn.type === "LONG" && quote === "bids") {
    if (collatral.available < totprice)
      throw new Error("not suffficnet avaliable balance ");
    collatral.available -= totprice;
    collatral.locked += totprice;
  } else if (posn.type === "LONG" && quote === "asks") {
    collatral.available += totprice;
    collatral.locked -= totprice;
  } else if (posn.type === "SHORT" && quote === "bids") {
    collatral.available += totprice;
    collatral.locked -= totprice;
  } else if (posn.type === "SHORT" && quote === "asks") {
    if (collatral.available < totprice)
      throw new Error("not suffficnet avaliable balance ");
    collatral.available -= totprice;
    collatral.locked += totprice;
  }
}

export function get_position(
  userId: string,
  asset: string,
  quote: string,
): Position {
  let user = users.find((user) => {
    return userId == user.userId;
  });
  if (!user) {
    throw new Error("user not existing");
  }
  let pos = user.positions;
  let req_market = pos.find((p) => p.market === asset);
  if (!req_market) {
    req_market = {
      market: asset,
      type: quote === "asks" ? "SHORT" : "LONG",
      margin: 0,
      qty: 0,
      liquidationPrice: 0,
      averagePrice: 0,
    };
  }
  return req_market;
}

export function tradermatcher(trader:UserInterface,qty:number,userId:string,price:number,type:string,asset:string)
{
    //bids==long
  //asks==short
  const resting_quote = type === "bids" ? "asks" : "bids";
    let filledQty = 0;
    const tot_price = qty * price;
    //here call update balances
    const trader_posn = get_position(userId, asset, "bids");
    updatebalance(trader, trader_posn, qty, type, tot_price);
    let asset_book = orderbooks[asset];
    if (!asset_book) {
      asset_book = {
        bids: {},
        asks: {},
        lastTradedPrice: 0,
        indexPrice: 0,
      };
    }

    //asset book
    let resting_orders: Record<string, Bid> =
      asset_book[resting_quote as "bids" | "asks"];
    if (!resting_orders) {
      resting_orders = {
        "": { availableQty: 0, openOrders: [] }, // string key, not null
      };
    }
    let valid_price=get_valid_price(resting_quote,resting_orders,price)
    for (const resting_price of valid_price) {
      let Orders = resting_orders[resting_price];
      if (!Orders) {
        Orders = {
          availableQty: 0,
          openOrders: [],
        };
      }
      for (const openOrder of Orders.openOrders) {
        const traded_qty = Math.min(
          openOrder.qty - openOrder.filledQty,
          qty - filledQty,
        );
        const trading_price = traded_qty * Number(resting_price);
        let rester = users.find((user) => user.userId === openOrder.userId);
        if(!rester)
          throw new Error("rester not found");
        if (traded_qty > 0) {
          //qty
          let resting_posn = get_position(openOrder.userId, asset, "asks");
          updatepnlandavgprice(
            trader,
            trader_posn,
            type,
            trading_price,
            traded_qty,
          );
          updatepnlandavgprice(
            rester,
            resting_posn,
            type,
            trading_price,
            traded_qty,
          );         
          openOrder.filledQty += traded_qty; //edge case left here where we split in 2 order
          filledQty += traded_qty;
          Orders.availableQty -= traded_qty;
          //status filled ??
          //RESTER
          const filledflag = openOrder.qty === openOrder.filledQty;
          let resting_order = openOrder;
          if (!resting_order) {
            throw new Error("order found in orderbook but not in user orders");
          }
          // resting_order.status = filledflag ? "filled" : "open";
          //ORDERBOOK ONLY LAST TRADING PRICE IS UPDATED
          asset_book.lastTradedPrice = Number(resting_price);
          //here we are updating asks
          const orderId = crypto.randomUUID();
          if (filledQty !== qty) {
            if (!asset_book.bids[price]) {
              asset_book.bids[price] = {
                availableQty: 0,
                openOrders: [],
              };
            }
            asset_book.bids[price].availableQty += qty - filledQty;
            asset_book.bids[price].openOrders.push({
              userId: userId,
              qty: qty,
              filledQty: filledQty,
              orderId: orderId,
              createdAt: new Date(),
            });
          }
}
      }
    }
  }

export async function order_handler(req: any, res: Response) {
  const parsedBody = orderschema.safeParse(req.body);
  if (!parsedBody.success) {
    throw new Error("the req is not correct to engine");
  }
  let fills: fillsinterface[];
  const { asset, userId, qty, type, price } = parsedBody.data;
  let trader = users.find((user) => user.userId === userId);
  if (!trader) {
    trader = {
      userId: userId,
      collateral: {
        available: 0,
        locked: 0,
      },
      positions: [],
    };
    users.push(trader);
  }
  const trader_posn=get_position(userId,asset,type);
  if(!isincreasingposn(type,trader_posn.type) && trader_posn.qty<qty)
  {
    //matcher
    tradermatcher(trader,trader_posn.qty,userId,price,type,asset);
    tradermatcher(trader,qty-trader_posn.qty,userId,price,type,asset);
  }
  else {
      tradermatcher(trader,qty,userId,price,type,asset);
  }

            /**
             * type Orderbooks = {
    [x: string]: {
        bids: {
            [x: string]: Bid;
        };
        asks: {
            [x: string]: Bid;
        };
        lastTradedPrice: number;
        indexPrice: number;
    };

  
}
             */
          //complete the the trader details
          // type,qty,liqprcie,avgpricr,pnl
          //we don't need to update the trading price in orderbook as this was
          // updated by rester
          // update filledqty in bids
          //           export interface Collateral {
          //   available: number;
          //   locked: number;
          // }
        
    }

// trader.orders.push({
//   orderId: orderId,
//   market: asset,
//   type: trader_posn.type,
//   qty: qty,
//   margin: 0, //not understood now
//   orderType: "limit",
//   price: price,
//   status: filledQty === qty ? "filled" : "open",
// });
//the plan is to return the fills with resp to backend
//the fills will contain the order matched
//now the backend will do some logic matching
//and then fire and forget to db
