const fs = require('fs');
const path = require('path');
const api = require ('./api.js');
const equal = require('deep-equal');

const performConditionalTrade = condition => new Promise(async (resolve, reject) => {
    try {    
        const status = await api.checkOrderStatus(condition.uuid).catch((err) => { reject(err) });
        if (!status.isOpen && !status.CancelInitiated) {
            const trade = await api.makeBittrexOrder(condition.options).catch((err) => { reject(err) });
            if (trade && trade.success) {
                iterateCondition(condition, trade.uuid);
            };
        } 
    } catch (err) { console.error(err) }
});   

const iterateCondition = (condition, uuid) => {
    fs.readFile(path.resolve(__dirname + "/conditions.json"), async (err, data) => {
        if (err) console.error(err);
        const pendingTrades = JSON.parse(data)

        const filteredTrades = pendingTrades.map((p) => {
            console.log(!equal(p, condition))
            console.log
            if (!equal(p, condition)) return p;
            if (p.nextCondition) {
                p.nextCondition.uuid = condition.uuid;
                return p.nextCondition 
            }
        }).filter((item) => item);

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
        const initialTradeOptions = { 
            market: 'BTC-OMG', 
            quantity: 0.3, 
            rate: 0.00187, 
            buyOrSell: 'sell' 
        }
        const tradeResult = await api.makeBittrexOrder(initialTradeOptions).catch((err) => { console.error("makeBittrexOrder rejected " + JSON.stringify(initialTradeOptions, null, '\trade')); console.error(err) });

        const fourthCondition = {
            options: { 
                market: 'BTC-OMG', 
                quantity: 0.3, 
                rate: 0.0018696, 
                buyOrSell: 'sell' 
            }, 
            nextCondition: false
        }

        const thirdCondition = {
            options: { 
                market: 'BTC-OMG', 
                quantity: 0.3, 
                rate: 0.0018697, 
                buyOrSell: 'sell' 
            }, 
            nextCondition: fourthCondition
        }

        const secondCondition = {
            options: { 
                market: 'BTC-OMG', 
                quantity: 0.3, 
                rate: 0.0018698, 
                buyOrSell: 'sell' 
            }, 
            nextCondition: thirdCondition
        }

        const firstCondition = {
            uuid: tradeResult.result.uuid, 
            options: { 
                market: 'BTC-OMG', 
                quantity: 0.3, 
                rate: 0.0018699, 
                buyOrSell: 'sell' 
            }, 
            nextCondition: secondCondition
        }

        pushCondition(firstCondition)
    } catch(err) {
        console.error(err)
    }
    
}

// trade();
// fs.readFile(path.resolve(__dirname + "/conditions.json"), async (err, data) => {
//     if (err) console.error(err);
//     const pendingTrades = JSON.parse(data)
//     performConditionalTrade(pendingTrades[0]).catch((err) => { console.error(err) })
// })


