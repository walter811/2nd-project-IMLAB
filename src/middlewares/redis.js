require("dotenv").config();
const redis = require("redis");
const ExchangeRate = require("./exchangeRate");
const processDeliveryCost = require("./parsing");

const redisServer = async () => {
  const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
    legacyMode: true,
  });

  redisClient.on("connect", () => console.info("Redis connected"));
  redisClient.on("error", (err) => {
    console.error("Redis Client Error", err);
  });

  redisClient.connect().then();
  const redisCli = redisClient.v4;

  return redisCli;
};

const setDollerRate = async () => {
  const exchange = new ExchangeRate();

  const redis = await redisServer();

  const getRawData = async () => await exchange.getDealRate("USD");

  getRawData().then(async (res) => {
    if (await redis.exists("doller")) {
      await redis.del("doller");
    }
    await redis.set("doller", res);
  });
};

const setDeliveryCost = async () => {
  const result = await processDeliveryCost();

  const redis = await redisServer();

  if (await redis.exists("deliveryCost")) {
    await redis.del("deliveryCost");
  }

  await redis.set("deliveryCost", JSON.stringify(result));
};

const getDeliveryCost = async () => {
  const redis = await redisServer();
  const val = JSON.parse(await redis.get("deliveryCost"));
  return val;
};

const getDollerRate = async () => {
  const redis = await redisServer();
  const result = await redis.get("doller");
  return result;
};

module.exports = { redisServer, getDeliveryCost, getDollerRate };
