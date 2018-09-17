var oauth = require("../lib/auth"),
    keystone = require("keystone"),
    Group = keystone.list("Group"),
    Bill = keystone.list("Bill"),
    Notification = keystone.list("Notification"),
    updateItem = require("../lib/updateItem"),
    async = require("async"),
    cleanBill = require("./groups/cleanBill");

exports = module.exports = function(req, res){
/*    oauth.display();
    res.apiResponse(null);*/

/*    Group.model.findOne({'_id': '5a5eba9e33549f632f6eceee'})
    .exec()
    .then(function(group){
        group.members.push('5a5da91963c6c15d1e877041');
        return updateItem(Group.model, group);
    })
    .then(function(group){res.apiResponse(group)});*/

/*    Notification.model.findOne({'_id': '5a5dcfd68c54935f2b6978b6'})
    .exec()
    .then(function(notification){
        notification.itemId = "5a5dcfd68c54935f2b6978b5";
        return updateItem(Notification.model, notification);
    })*/

/*    cleanBill("5a5eba9e33549f632f6eceee")
    .then(function(){
        res.apiResponse("Successfully Clean BIll");
    })
    .catch(function(err){
        logger[err.level](err);
        res.apiError(err.message, err);
    })*/

    // Notification.model.find().exec()
    // .then(function(nots){
    //     var tasks = [];
    //     for (var i=0;i<nots.length;i++){
    //         nots[i].itemId = JSON.parse(nots[i].itemId);
    //         logger.debug(nots[i].itemId);
    //     }
    //     nots.forEach(function(not){
    //         tasks.push(function(done){
    //             updateItem(Notification.model, not)
    //             .then(function(){done()})
    //         })            
    //     })

    //     async.parallel(tasks, function(){res.apiResponse("Update Success")});
    // });

    // Group.model.findOne({"_id": "5a609eda8460286d6c4203bd"})
    // .exec()
    // .then(function(group){
    //     group.bills = [];
    //     updateItem(Group.model, group)
    //     .then(function(){
    //         res.apiResponse(null);
    //     })
    // })

    // var A = "5a609cf4516bff6d5cfcc682";
    // var B = "5a609d1a516bff6d5cfcc683";
    // var C = "5a609d26516bff6d5cfcc684";
    // var D = "5a609d33516bff6d5cfcc685";
    // var billOne = {
    //     'group': '5a609eda8460286d6c4203bd',
    //     'payer': A,
    //     'participants': [B,C,D],
    //     'amount':20
    // }
    // var billTwo = {
    //     'group': '5a609eda8460286d6c4203bd',
    //     'payer': B,
    //     'participants': [A,C],
    //     'amount':10
    // }
    // var billThree = {
    //     'group': '5a609eda8460286d6c4203bd',
    //     'payer': D,
    //     'participants': [A,B],
    //     'amount':7
    // }
    // var billFour = {
    //     'group': '5a609eda8460286d6c4203bd',
    //     'payer': C,
    //     'participants': [A,D],
    //     'amount':9
    // }
    // var bills = [billOne, billTwo, billThree, billFour];
    // var billId = [];
    // var saves = [];
    // bills.forEach(function(bill){
    //     saves.push(function(done){
    //         (new Bill.model(bill)).save()
    //         .then(function(item){
    //             billId.push(item._id);
    //             done();
    //         })
    //     });
    // });
    // async.parallel(saves, function(err){
    //     Group.model.findOne({'_id': '5a609eda8460286d6c4203bd'})
    //     .exec()
    //     .then(function(group){
    //         logger.debug("Bill Id: " + billId);
    //         group.bills = billId;
    //         updateItem(Group.model, group)
    //         .then(function(){
    //             res.apiResponse("Bill Created");
    //         })
    //     })
        
    // });
    
}