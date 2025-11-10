const axios = require("axios");
const fs = require("fs");
const express = require("express");
const API_URL = "https://api.upstox.com/v2/option/chain";
const LTP_API_URL = "https://api.upstox.com/v2/market-quote/ltp";
const ORDER_API_URL = "https://api.upstox.com/v3/order/gtt/place";

const instrumentKey = "NSE_INDEX|Nifty 50";
const expiryDate = "2025-11-11";
const tokens = [
    "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI2TUFTWlIiLCJqdGkiOiI2OTExNWFiNmNkYTRmNzJmNTFiNWYxYzMiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6ZmFsc2UsImlhdCI6MTc2Mjc0NTAxNCwiaXNzIjoidWRhcGktZ2F0ZXdheS1zZXJ2aWNlIiwiZXhwIjoxNzYyODEyMDAwfQ.iC0qyyEKVtmNv5TNMFtCz6-fYRa4vXLD8qz9NzWcOW4",
    "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI2TUFTWlIiLCJqdGkiOiI2OTExNWFiYzMyNDFjMTE5ZGU0NDQwMDAiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6ZmFsc2UsImlhdCI6MTc2Mjc0NTAyMCwiaXNzIjoidWRhcGktZ2F0ZXdheS1zZXJ2aWNlIiwiZXhwIjoxNzYyODEyMDAwfQ.aSt0DuYB3xOhAzps-g0It2txDc9VIt9TAYkufnEO6bw",
    "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI2TUFTWlIiLCJqdGkiOiI2OTExNWFiZWNkYTRmNzJmNTFiNWYxYzciLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6ZmFsc2UsImlhdCI6MTc2Mjc0NTAyMiwiaXNzIjoidWRhcGktZ2F0ZXdheS1zZXJ2aWNlIiwiZXhwIjoxNzYyODEyMDAwfQ.d_hMiHBkVFEb62Z_5B2pb_rOI7uXx8t-_qo3s5aaRs8",
    "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI2TUFTWlIiLCJqdGkiOiI2OTExNWFjMWVhOTljNDY0YzUzNjNhYzYiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6ZmFsc2UsImlhdCI6MTc2Mjc0NTAyNSwiaXNzIjoidWRhcGktZ2F0ZXdheS1zZXJ2aWNlIiwiZXhwIjoxNzYyODEyMDAwfQ.wO7gGpH4PM4qyMMUWZsLh07b4X6hiD8QU8Ql0wTS2zU",
    "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI2TUFTWlIiLCJqdGkiOiI2OTExNWFjMzMyNDFjMTE5ZGU0NDQwMDIiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6ZmFsc2UsImlhdCI6MTc2Mjc0NTAyNywiaXNzIjoidWRhcGktZ2F0ZXdheS1zZXJ2aWNlIiwiZXhwIjoxNzYyODEyMDAwfQ.v3XesZ_RrpoSdlSGvUyGbk9xfdvCuOC0PbppWZ6JeFE",
    "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI2TUFTWlIiLCJqdGkiOiI2OTExNWFjZWNkYTRmNzJmNTFiNWYxY2IiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6ZmFsc2UsImlhdCI6MTc2Mjc0NTAzOCwiaXNzIjoidWRhcGktZ2F0ZXdheS1zZXJ2aWNlIiwiZXhwIjoxNzYyODEyMDAwfQ.J29H04QjZwy6XwXt4RkUyPp3WLnZsag58H_eYSqCL8M"
];
let tokenIndex = 0;

function getToken() {
    tokenIndex = (tokenIndex + 1) % tokens.length;
    return tokens[tokenIndex];
}

let datalist = [];
const datalistLength = 5;

const levels = [
    { threshold: 500, minChange: 20, stoploss: 10, gap: 1 },
    { threshold: 400, minChange: 10, stoploss: 5, gap: 1 },
    { threshold: 300, minChange: 5, stoploss: 4, gap: 1 },
    { threshold: 200, minChange: 4, stoploss: 3.5, gap: 1 },
    { threshold: 100, minChange: 3, stoploss: 2.5, gap: 1 },
    { threshold: 50, minChange: 2.5, stoploss: 2, gap: 1 },
    { threshold: 25, minChange: 2, stoploss: 2, gap: 1 },
    { threshold: 10, minChange: 1, stoploss: 1, gap: 1 },
    { threshold: 5, minChange: 0.75, stoploss: 0.5, gap: 0.25 }
];

// State for orders
const orderMemory = {
    call: null,
    put: null,
    history: []
};

function saveOrderToDisk() {
    fs.writeFileSync("./orderjson.json", JSON.stringify(orderMemory, null, 4));
}

// Express API for viewing order state
const app = express();
app.get("/placeorder/details", (req, res) => {
    res.json(orderMemory);
});
app.listen(3000, () => {
    //console.log("Order Details API running at http://localhost:3344/placeorder/details");
});

// Actual Upstox order placement
async function placeOrderToUpstox(token, qty, entryPrice, stoploss, trailingGap) {
    const payload = {
        type: 'MULTIPLE',
        quantity: qty,
        product: 'I',
        instrument_token: token,
        transaction_type: 'BUY',
        rules: [
            { strategy: 'ENTRY', trigger_type: 'ABOVE', trigger_price: entryPrice },
            { strategy: 'TARGET', trigger_type: 'IMMEDIATE', trigger_price: entryPrice * 25 },
            { strategy: 'STOPLOSS', trigger_type: 'IMMEDIATE', trigger_price: entryPrice - stoploss, trailing_gap: trailingGap }
        ]
    };
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
    try {
        const response = await axios.post(ORDER_API_URL, payload, { headers });
        if (response.data.status !== "success") throw new Error("Order rejected: " + JSON.stringify(response.data));
        return response.data;
    } catch (e) {
        console.error("Failed to place real Upstox order:", e.message);
        return null;
    }
}

function createOrderData(type, token, entryPrice, stoploss, trailingGap, qty, realOrderId = null) {
    const now = new Date().toISOString();
    return {
        type,
        token,
        entryPrice,
        stoplossPrice: entryPrice - stoploss,
        trailingGap,
        qty,
        status: "active",
        targetPrice: entryPrice * 25,
        entryTime: now,
        exitTime: null,
        exitReason: null,
        ltpTrail: [entryPrice],
        realOrderId
    };
}

// Option chain and LTP fetchers
async function getNearestOptionInstrumentKeys() {
    try {
        const response = await axios.get(API_URL, {
            params: { instrument_key: instrumentKey, expiry_date: expiryDate },
            headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` }
        });
        const options = response.data.data;
        if (!options || options.length === 0) throw new Error("No option chain data.");
        let nearest = null, minDiff = Infinity;
        for (const option of options) {
            if (typeof option.strike_price === "number" && typeof option.underlying_spot_price === "number") {
                const diff = Math.abs(option.strike_price - option.underlying_spot_price);
                if (diff < minDiff) {
                    minDiff = diff;
                    nearest = option;
                }
            }
        }
        if (!nearest) throw new Error("No nearest option found.");
        return {
            callKey: nearest.call_options.instrument_key,
            putKey: nearest.put_options.instrument_key,
            strike: nearest.strike_price,
            spot: nearest.underlying_spot_price,
            diff: minDiff
        };
    } catch (error) {
        console.error("Failed to get option keys:", error.message);
        return null;
    }
}

async function getLtp(keys) {
    try {
        const response = await axios.get(LTP_API_URL, {
            params: { instrument_key: keys },
            headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` }
        });
        const ltpData = response.data.data || {};
        let result = { call: null, put: null };
        for (const key in ltpData) {
            if (key.includes("CE")) result.call = ltpData[key];
            else if (key.includes("PE")) result.put = ltpData[key];
        }
        return result;
    } catch (error) {
        console.error("Failed to get LTP:", error.message);
        return null;
    }
}

// Trailing and order-exit logic
async function monitorOrderLtp(type, lastLtp) {
    const order = orderMemory[type];
    if (!order || order.status !== "active") return false;
    order.ltpTrail.push(lastLtp);

    // Trailing logic
    if (type === "call") {
        let newStop = Math.max(order.stoplossPrice, lastLtp - order.trailingGap);
        if (newStop > order.stoplossPrice) order.stoplossPrice = newStop;
    } else if (type === "put") {
        let newStop = Math.min(order.stoplossPrice, lastLtp + order.trailingGap);
        if (newStop < order.stoplossPrice) order.stoplossPrice = newStop;
    }

    let exit = null;
    if (type === "call") {
        if (lastLtp >= order.targetPrice) exit = "target";
        else if (lastLtp <= order.stoplossPrice) exit = "stoploss";
    } else {
        if (lastLtp >= order.targetPrice) exit = "target";
        else if (lastLtp <= order.stoplossPrice) exit = "stoploss";
    }

    if (exit !== null) {
        order.status = "exited";
        order.exitTime = new Date().toISOString();
        order.exitReason = exit;
        saveOrderToDisk();
        orderMemory[type] = null;
        console.log(`Order ${type.toUpperCase()} exited by ${exit}.`);
        return true;
    }
    return false;
}

let lastStrike = null;

async function tracker() {
    const result = await getNearestOptionInstrumentKeys();
    if (!result) return;
    const { strike, callKey, putKey } = result;
    const ltpResult = await getLtp([callKey, putKey].join(","));
    if (!ltpResult || !ltpResult.call || !ltpResult.put) return;

    let entry = {
        strikePrice: strike,
        callLtp: ltpResult.call.last_price,
        callToken: ltpResult.call.instrument_token,
        putLtp: ltpResult.put.last_price,
        putToken: ltpResult.put.instrument_token
    };

    if (lastStrike !== null && strike !== lastStrike) {
        if (strike > lastStrike && strike - lastStrike <= 100) {
            // Upward logical jump; keep datalist
        } else if (strike < lastStrike) {
            datalist = [];
        }
    }
    lastStrike = strike;
    datalist.push(entry);
    if (datalist.length > datalistLength) datalist.shift();
    if (datalist.length > 1)
        while (datalist.length && datalist[0].strikePrice < strike) datalist.shift();

    // Monitor open orders' exit logic (trailing, stoploss, target)
    if (orderMemory.call) await monitorOrderLtp("call", entry.callLtp);
    if (orderMemory.put) await monitorOrderLtp("put", entry.putLtp);

    if (datalist.length < datalistLength) return;

    const calldiff = datalist[datalist.length - 1].callLtp - datalist[0].callLtp;
    const putdiff = datalist[datalist.length - 1].putLtp - datalist[0].putLtp;

    console.log(`Strike: ${strike}, ${entry.callLtp}|${entry.putLtp} , ${calldiff.toFixed(2)}|${putdiff.toFixed(2)}`);

    try {
        for (const lv of levels) {
            if (!orderMemory.call && calldiff > lv.threshold && calldiff > lv.minChange) {
                const upstoxResult = await placeOrderToUpstox(entry.callToken, 75, datalist[datalist.length - 1].callLtp, lv.stoploss, lv.gap);
                // Save order data with Upstox order info
                orderMemory.call = createOrderData("call", entry.callToken, datalist[datalist.length - 1].callLtp, lv.stoploss, lv.gap, 75, upstoxResult && upstoxResult.data ? upstoxResult.data.order_id : null);
                orderMemory.history.push({ ...orderMemory.call });
                saveOrderToDisk();
                break;
            }
            if (!orderMemory.put && putdiff > lv.threshold && datalist[0].putLtp > lv.minChange) {
                const upstoxResult = await placeOrderToUpstox(entry.putToken, 75, datalist[datalist.length - 1].putLtp, lv.stoploss, lv.gap);
                orderMemory.put = createOrderData("put", entry.putToken, datalist[datalist.length - 1].putLtp, lv.stoploss, lv.gap, 75, upstoxResult && upstoxResult.data ? upstoxResult.data.order_id : null);
                orderMemory.history.push({ ...orderMemory.put });
                saveOrderToDisk();
                break;
            }
        }
    } catch (e) { console.error(e); }
}

// Run loop
setInterval(tracker, 1000);
