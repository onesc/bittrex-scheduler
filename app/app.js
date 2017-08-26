const fs = require('fs');
const path = require('path');
const api = require ('./api.js');
const equal = require('deep-equal');
const utils = require('./utils');

const startSequence = async () => {
    try {
        const tradeResult = await api.makeBittrexOrder({ 
            market: 'BTC-OMG', 
            quantity: 0.3,  
            rate: 0.00187, 
            buyOrSell: 'sell' 
        }).catch((err) => { console.error("makeBittrexOrder rejected " + JSON.stringify(initialTradeOptions, null, '\trade')); console.error(err) });

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

        const condition = utils.constructSequence(seq, tradeResult.result.uuid);
        utils.pushCondition(condition)
    } catch(err) {
        console.error(err)
    }
    
}

startSequence();

const executeConditions = () => {
    fs.readFile(path.resolve(__dirname + "/conditions.json"), async (err, data) => {
        if (err) console.error(err);
        const conditions = JSON.parse(data)
        conditions.forEach(async(c) => {
            await performConditionalTrade(c).catch((err) => { console.error(err) })
        })
    })  
}

// executeConditions()


