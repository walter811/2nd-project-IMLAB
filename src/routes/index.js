const express = require("express");
const router = express.Router();

const couponRouter = require("./couponRouter.js");
const orderRouter = require("./orderRouter");

router.use("/coupon", couponRouter.router);
router.use("/order", orderRouter.router);

module.exports = router;
