const fs = require('fs');
const path = require('path');
const api = require ('./api.js');

const performConditionalTrade = condition => new Promise(async (resolve, reject) => {
    const status = await api.checkOrderStatus(condition.uuid).catch((err) => { reject(err) });

    if (!status.isOpen && !status.CancelInitiated) {
        console.log(condition.originalOptions + " was successful! making order ", condition.options);
        await api.makeBittrexOrder(condition.options).catch((err) => { console.error(err) });
        if (condition.nextCondition) { pushNewCondition(condition.nextCondition) };
    } else {
        console.log("barnt");
    }
});    

const pushNewCondition = condition => {
    fs.readFile(path.resolve(__dirname) + "/conditions.json", async (err, data) => {
       const pendingTrades = JSON.parse(data)
       pendingTrades.push(condition);
       fs.writeFile("./conditions.json", JSON.stringify(pendingTrades))   
    })
}

const trade = async () => {
    const tradeOptions = { 
        market: 'BTC-OMG', 
        quantity: 1, 
        rate: 0.001, 
        buyOrSell: 'buy' 
    }

    const conditionalTradeOptions = { market: 'BTC-OMG', quantity: 1, rate: 0.004, buyOrSell: 'sell' }

    const tradeResult = await api.makeBittrexOrder(tradeOptions).catch((err) => { console.error(err) });

    const condition = {
        uuid: tradeResult.result.uuid, 
        options: conditionalTradeOptions, 
        originalOptions: tradeOptions, 
        nextCondition: false
    }

    console.log(condition)

    pushNewCondition(condition)
}


// fs.readFile(path.resolve(__dirname) + "/conditions.json", async (err, data) => {
//     const pendingTrades = JSON.parse(data) 
//     const status = await performConditionalTrade(pendingTrades[0])
// })
// console.log(process.env)
trade();
