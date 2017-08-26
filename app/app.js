const fs = require('fs');
const path = require('path');
const api = require ('./api.js');
const equal = require('deep-equal');

const performConditionalTrade = condition => new Promise(async (resolve, reject) => {
    const status = await api.checkOrderStatus(condition.uuid).catch((err) => { reject(err) });
    if (!status.isOpen && !status.CancelInitiated) {
        const trade = await api.makeBittrexOrder(condition.options).catch((err) => { reject(err) });
        if (trade && trade.success) {
            removeCondition(condition);

            if (condition.nextCondition) {
                condition.nextCondition.uuid = trade.result.uuid;
                pushCondition(condition.nextCondition) 
            } 
        };
    } 
});   

const removeCondition = (condition, all = false) => {
    fs.readFile(path.resolve(__dirname + "/conditions.json"), async (err, data) => {
        if (err) console.error(err);
        const pendingTrades = JSON.parse(data)
        const filteredTrades = pendingTrades.map((p) => {
            if (!equal(p, condition)) return p;
        }).filter((item) => item)
        fs.writeFileSync(path.resolve(__dirname + "/conditions.json"), JSON.stringify(filteredTrades, null, '\t'))   
    })
}

const pushCondition = condition => {
    fs.readFile(path.resolve(__dirname + "/conditions.json"), async (err, data) => {
        if (err) console.error(err);
        const pendingTrades = JSON.parse(data)
        pendingTrades.push(condition);
        fs.writeFileSync(path.resolve(__dirname + "/conditions.json"), JSON.stringify(pendingTrades, null, '\t'))   
    })
}   

const trade = async () => {
    try {
        const tradeOptions = { 
            market: 'BTC-OMG', 
            quantity: 0.5, 
            rate: 0.00188270, 
            buyOrSell: 'sell' 
        }

        const conditionalTradeOptions = { market: 'BTC-OMG', quantity: 0.5, rate: 0.00185744, buyOrSell: 'buy' }

        const tradeResult = await api.makeBittrexOrder(tradeOptions).catch((err) => { console.error("makeBittrexOrder rejected " + JSON.stringify(tradeOptions, null, '\trade')); console.error(err) });

        const condition = {
            uuid: tradeResult.result.uuid, 
            options: conditionalTradeOptions, 
            originalOptions: tradeOptions, 
            nextCondition: false
        }

        pushCondition(condition)
    } catch(err) {
        console.error(err)
    }
    
}
// console.log(process.env.BKEY)
// trade();

fs.readFile(path.resolve(__dirname + "/conditions.json"), async (err, data) => {
        if (err) console.error(err);
        const pendingTrades = JSON.parse(data)
        performConditionalTrade(pendingTrades[0]).catch((err) => { console.error(err) })
    })

// performConditionalTrade()

