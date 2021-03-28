-- CreateTable
CREATE TABLE "Transfer" (
    "txhash" TEXT NOT NULL PRIMARY KEY,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    FOREIGN KEY ("tokenAddress") REFERENCES "TokenMetaData" ("address") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TokenMetaData" (
    "address" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "symbol" TEXT,
    "decimals" INTEGER,
    "type" TEXT NOT NULL
);
