export interface Collateral {
  available: number;
  locked: number;
}
export interface Position {
  market: string;
  type: "LONG" | "SHORT";
  qty: number;
  margin: number;
  liquidationPrice: number;
  averagePrice: number;
  pnl?: number;  
}

export interface Order {
  orderId: string;
  market: string;
  type: "LONG" | "SHORT";
  qty: number;
  margin: number;
  orderType: "limit" | "market";
  price: number;
  status: "filled" | "open" | "cancelled";
}
export interface UserInterface {
  userId: string;
  collateral: Collateral;
  positions: Position[];
}
export const users: UserInterface[] = [
  {
    userId: "1",
    collateral: {
      available: 2000,
      locked: 1000,
    },
    positions: [
      {
        market: "SOL",
        type: "LONG",
        qty: 10,
        margin: 500,
        liquidationPrice: 80,
        averagePrice: 90,
      },
      {
        market: "ETH",
        type: "SHORT",
        qty: 1,
        margin: 500,
        liquidationPrice: 2000,
        averagePrice: 1900,
      },
    ],
 
  },
  {
    userId: "2",
    collateral: {
      available: 2000,
      locked: 2000,
    },
    positions: [
      {
        market: "SOL",
        type: "SHORT",
        qty: 10,
        margin: 1000,
        liquidationPrice: 80,
        pnl: 200,
        averagePrice: 90,
      },
      {
        market: "ETH",
        type: "LONG",
        qty: 1,
        margin: 1000,
        liquidationPrice: 2000,
        pnl: -100,
        averagePrice: 1900,
      },
    ],
  },
];

export type Bid = {
  availableQty: number;
  openOrders: {
    userId: string;
    qty: number;
    filledQty: number;
    orderId: string;
    createdAt: Date;
  }[];
};

export type Orderbook = {
  bids: Record<string, Bid>;
  asks: Record<string, Bid>;
  lastTradedPrice: number;
  indexPrice: number;
};

export type Orderbooks = Record<string, Orderbook>;

export const orderbooks: Orderbooks = {
  BTCUSDT: { bids: {}, asks: {}, lastTradedPrice: 90, indexPrice: 90.01 },
  ETHUSDT: { bids: {}, asks: {}, lastTradedPrice: 1900, indexPrice: 1899.9 },
};

export interface fillsinterface {
  maker: string;
  taker: string;
  market: string;
  qty: number;
  price: number;
  long: number;
  short: number;
}
export const fills:fillsinterface[] = [
  {
    maker: "1",
    taker: "2",
    market: "SOL",
    qty: 10,
    price: 90,
    long: 1,
    short: 2,
  },
  {
    maker: "1",
    taker: "2",
    market: "ETH",
    qty: 1,
    price: 1900,
    long: 2,
    short: 1,
  },
];