const Bittrex = require('node.bittrex.api');
const apikeys = require('./apikeys');
Bittrex.options(apikeys.bittrex);

const makeBittrexOrder = options => new Promise((resolve, reject) => {
    const url = `https://bittrex.com/api/v1.1/market/${options.buyOrSell}limit?apikey=${apikeys.bittrex.apikey}&market=${options.market}&quantity=${options.quantity}&rate=${options.rate}`;
    Bittrex.sendCustomRequest(url, (data, err) => {
        if (err) reject(err)
        else resolve(data);
    }, true);
});

const checkOrderStatus = uuid => new Promise((resolve, reject) => {
    const url = `https://bittrex.com/api/v1.1/account/getorder?uuid=${uuid}`
    Bittrex.sendCustomRequest(url, (data, err) => {
        if (err) reject(err)
        else resolve(data);
    }, true);
});

exports.makeBittrexOrder = makeBittrexOrder;
exports.checkOrderStatus = checkOrderStatus;