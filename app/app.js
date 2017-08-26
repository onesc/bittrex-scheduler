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
                console.log("CONDITION MET!", JSON.stringify(condition, null, '\t'));
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

const constructSequence = (sequence, uuid) => {
    let obj = null;
    for (var i = sequence.length - 1; i >= 0; i--) {
        if (sequence.length === i + 1) {
            obj = {options: {...sequence[i]}}
        } else {
            obj = {options: {...sequence[i]}, nextCondition: {...obj}}      
        }
    }
    if (uuid) { obj.uuid = uuid };
    return obj;
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

        const seq = [{ 
            market: 'BTC-OMG', 
            quantity: 0.3, 
            rate: 0.0018699, 
            buyOrSell: 'sell' 
        }, { 
            market: 'BTC-OMG', 
            quantity: 0.3, 
            rate: 0.0018698, 
            buyOrSell: 'sell' 
        }, { 
            market: 'BTC-OMG', 
            quantity: 0.3, 
            rate: 0.0018697, 
            buyOrSell: 'sell' 
        }, { 
            market: 'BTC-OMG', 
            quantity: 0.3, 
            rate: 0.0018696, 
            buyOrSell: 'sell' 
        }];

        const condition = constructSequence(seq, tradeResult.result.uuid);
        pushCondition(condition)
    } catch(err) {
        console.error(err)
    }
    
}

// trade();

const executeConditions = () => {
    fs.readFile(path.resolve(__dirname + "/conditions.json"), async (err, data) => {
        if (err) console.error(err);
        const conditions = JSON.parse(data)
        conditions.forEach(async(c) => {
            await performConditionalTrade(c).catch((err) => { console.error(err) })
        })
    })  
}

executeConditions()


