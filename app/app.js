const api = require ('./api');
const utils = require('./utils');

const insertSequence = async () => {
    try {
        const tradeResult = await api.makeBittrexOrder({ 
            market: 'BTC-OMG', 
            quantity: 20,  
            rate: 0.00195, 
            buyOrSell: 'sell' 
        }).catch((err) => { console.error("makeBittrexOrder rejected " + JSON.stringify(initialTradeOptions, null, '\trade')); console.error(err) });

        const seq = [{ 
            market: 'BTC-OMG', 
            quantity: 20, 
            rate: 0.00185, 
            buyOrSell: 'buy' 
        }, { 
            market: 'BTC-OMG', 
            quantity: 20, 
            rate: 0.00195, 
            buyOrSell: 'sell' 
        }];

        const condition = utils.constructSequence(seq, tradeResult.result.uuid);
        utils.pushCondition(condition)
    } catch(err) {
        console.error(err)
    }
}

// insertSequence();
utils.executeConditions()
setInterval(utils.executeConditions, 180000)


