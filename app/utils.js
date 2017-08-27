const fs = require('fs');
const path = require('path');
const api = require ('./api.js');
const equal = require('deep-equal');

const executeConditions = async () => {
    fs.readFile(path.resolve(__dirname + "/conditions.json"), async (err, data) => {
        if (err) console.error(err);
        const conditions = JSON.parse(data)
        conditions.forEach(async(c) => {
            await performConditionalTrade(c).catch((err) => { console.error(err) })
        })
        console.log(new Date(), "checked conditions")
    })  
}

const performConditionalTrade = condition => new Promise(async (resolve, reject) => {
    try {    
        const status = await api.checkOrderStatus(condition.uuid).catch((err) => { reject(err) });
        if (!status.result.IsOpen && !status.result.CancelInitiated) {
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



exports.constructSequence = constructSequence;
exports.performConditionalTrade = performConditionalTrade;
exports.iterateCondition = iterateCondition;
exports.pushCondition = pushCondition;
exports.executeConditions = executeConditions;


