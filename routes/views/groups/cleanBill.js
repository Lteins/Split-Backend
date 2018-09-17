var keystone = require("keystone"),
    Debt = keystone.list("Debt"),
    Group = keystone.list("Group"),
    Bill = keystone.list("Bill"),
    populate = require("../../lib/populate"),
    async = require("async");


exports = module.exports = function(groupId){
    return Debt.model.find({'group': groupId}).exec()
    .then(function(oldDebts){
        logger.debug("Before delete oldDebts");
        logger.debug(oldDebts);
        if (oldDebts && oldDebts.length > 0){
            return new Promise(function(resolve, reject){
                var removeTasks = [];
                oldDebts.forEach(function(oldDebt){
                    removeTasks.push(function(done){
                        oldDebt.remove()
                        .then(function(){
                            done();
                        }, function(err){
                            done({
                                'message': 'Database Error when removing old Debts',
                                'orgin': 'cleanBill',
                                'level': 'error'
                            });
                        });
                    })
                    async.parallel(removeTasks, function(err){
                        if (err)
                            reject({
                                'message': 'Fail to remove old Debts',
                                'origin': 'clean Bill',
                                'level': 'error'
                            });
                        resolve();
                    })
                })
            })
        }
        else
            return null;
    })
    .then(function(){
        logger.debug("Before Retrieve Group");
        logger.debug("Group Id: " + groupId);
        return Group.model.findOne({'_id': groupId}) //Retrieve Information
                          .exec();
    })
    .then(function(group){
        logger.debug("Bill Id: ");
        logger.debug(group.bills);
        var idList = group.bills;
        var itemList = [];
        return populate(Bill.model, idList, itemList)
        .then(function(){
            logger.debug("bills");
            logger.debug(itemList);
            group.bills = itemList;
            return group;
        })
    })
    .then(function(group){
        logger.debug("Check Existence of group");
        //Check Existence of group
        if (!group)
            throw {
                'message': 'Group not found',
                'origin': 'CLean Bill',
                'level': 'warn'
            };
        logger.debug("Filter bills that do not need to be splitted");
        logger.debug(group.bills);
        //Filter bills that do not need to be splitted
        if (group.bills){
            for (var i=0;i<group.bills.length;i++){
                if (!(group.bills[i].participants && group.bills[i].participants.length > 0)){
                    group.bills.splice(i);
                    i--;
                }
            }
        }
        logger.debug("After filtering");
        logger.debug(group.bills);
        logger.debug("Check Existence of Bill");
        //Check Existence of Bill
        if (!(group.bills && group.bills.length > 0))
            throw {
                'message': 'No Bill to be retrieved',
                'origin': 'clean bill',
                'level': 'warn'
            };
        logger.debug("Initialize BillTable");
        //Initialize BillTable
        var billTable = [],
            temp = {};
        for (var i=0;i<group.bills.length;i++){
            temp = {};
            for (var j=0;j<group.members.length;j++){
                temp[group.members[j]] = 0;
            }
            billTable.push(temp);
        }
        logger.debug("Input Bill Information");
        //Input Bill Information
        var splitAmount;
        for (var i=0;i<group.bills.length;i++){
            billTable[i][group.bills[i].payer] = group.bills[i].amount;
            if (group.bills[i].participants && group.bills[i].participants.length > 0){
                splitAmount = group.bills[i].amount/group.bills[i].participants.length;
                for (var j=0;j<group.bills[i].participants.length;j++){
                    billTable[i][group.bills[i].participants[j]] = -splitAmount;
                }                
            }
        }
        logger.debug(billTable);
        logger.debug("Compute Total");
        //Compute Total
        var total = [];
        var userTotal = 0;
        for (var i=0;i<group.members.length;i++){
            userTotal = 0;
            for (var j=0;j<billTable.length;j++){
                userTotal = userTotal + billTable[j][group.members[i]];
            }
            total.push(userTotal);
        }
        logger.debug("TOTAL: " + total);
        //Sort Total And MemberList
        var sortStruct = [];
        for(var i=0;i<group.members.length;i++){
            sortStruct.push({
                'total': total[i],
                'member': group.members[i]
            });
        }
        sortStruct.sort(function(a, b){
            return a.total - b.total;
        })
        logger.debug("Compute I/O");
        //Comput I/O
        var out = [];
        out.push(0);
        for (var i=1;i<sortStruct.length;i++){
            out.push(out[i-1] + sortStruct[i-1].total);
        }
        logger.debug("Create Debts");
        //Create debts
        var newDebts = [];
        newDebts.push({
            'group': groupId,
            'toWhom': sortStruct[sortStruct.length-1].member,
            'fromWhom': sortStruct[0].member,
            'amount': out[0]
        });
        for (var i=1;i<out.length;i++){
            newDebts.push({
                'group':groupId,
                'toWhom': sortStruct[i-1].member,
                'fromWhom': sortStruct[i].member,
                'amount': out[i]
            });
        }
        //Save Debts
        logger.debug(newDebts);
        var saveTasks = [];
        newDebts.forEach(function(newDebt){
            saveTasks.push(function(done){
                (new Debt.model(newDebt)).save()
                .then(function(debt){
                    logger.debug("Save Debt Successfully " + debt);
                    done();
                }, function(err){
                    done({
                        'message': 'Database Error while saving debt',
                        'origin': 'Clean Bill',
                        'level': 'error',
                        'detail': err
                    });
                })                
            })

        })
        async.parallel(saveTasks, function(err){
            if (err){
                throw {
                    'message': 'Fail to Save Debt',
                    'origin': 'Clean Bill',
                    'level': 'error',
                    'detail': err,
                    'groupId': newDebts[0].group
                }
            }
            return group;
        })
    }, function(err){
        throw {
            'message': 'Database Error when retrieving group',
            'origin': 'Clean Bill',
            'level': 'error'
        };
    })
.catch(function(err){
    logger.debug(err);
})
}