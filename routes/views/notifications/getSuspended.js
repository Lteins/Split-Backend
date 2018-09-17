var keystone = require("keystone"),
    User = keystone.list("User"),
    Group = keystone.list("Group"),
    Debt = keystone.list("Debt"),
    Bill = keystone.list("Bill"),
    Notification = keystone.list("Notification"),
    Errors = require("../../lib/error"),
    errorHandler = require("../../lib/errorHandler"),
    populate = require("../../lib/populate"),
    retrieveItem = require("../../lib/retrieveItem");

//token:
exports = module.exports = function(req, res){
    var data = {user: req.user};
    retrieveUser(data)
    .then(filter)
    .then(pop)
    .then(function(data){
        logger.info("Return response from api getSuspended");
        console.log(data.response);
        console.log("-----------------------------------");
        res.apiResponse(data.response);
    })
    .catch(function(err){
        if (!err.customized)
            logger.error(err);
        err.addOrigin("getUnrepliedNotes");
        err.addRes(res);
    })
    .catch(errorHandler);
}

function retrieveUser(data){
    return retrieveItem(User, data.user._id, 'notifications')
        .then(function(user){
            data.user = user;
            return data;
        })
        .catch(function(err){
            err.addOrigin('retrieveUser');
            throw err;
        });
}

function filter(data){
    data.response = {'notifications': []};
    for (var i=0;i<data.user.notifications.length;i++){
        if (data.user.notifications[i].status == 'suspend')
            data.response.notifications.push(data.user.notifications[i]);
    }
    return data;
}

function pop(data){
    //retrieve fromWhom for all types of notification
    //retrieve group for group type
    //retrieve debt for debt type, retrieve group of the debt
    //retriebe bill for bill type, retrieve group of the bill
    var infoField = ['date', 'initiator', 'itemId', 'status', 'toWhom', 'type', '_id'];
    var notes = [];
    for (var i=0;i<data.response.notifications.length;i++){
        var temp = {};
        for (var j=0;j<infoField.length;j++){
            var x = infoField[j];
            temp[x] = data.response.notifications[i][x];
        }
        notes.push(temp);
    }
    var lists = {
        'Group': {
            'id': [],
            'item': [],
            'order': []
        },
        'Debt': {
            'id': [],
            'item': [],
            'order': []
        },
        'Bill': {
            'id': [],
            'item': [],
            'order': []
        },
    };
    classify();
    function classify(){
        for (var i=0;i<notes.length;i++){
            var type = notes[i].type;
            lists[type].id.push(notes[i].itemId);
            lists[type].order.push(i);
        }
    }    

    console.log(lists);

    return pullOrigin()
           .then(retrieveGroup)
           .then(retrieveDebt)
           .then(retrieveBill)
           .then(function(){
                console.log(notes);
                data.response.notifications = notes;
                return data;
           })
           .catch(function(err){
                err.addOrigin("pop");
                throw err;
           })


    function pullOrigin(){
        logger.debug("---------Pull Origin---------")
        var origins = [];
        var users = [];
        for (var i=0;i<notes.length;i++){
            origins.push(notes[i].initiator);
        }
        return populate(User.model, origins, users)
               .then(function(){
                    console.log(notes);
                    for (var i=0;i<users.length;i++){
                        notes[i].initiator = users[i].name;
                    }
                    console.log(notes);

               })
               .catch(function(err){
                   console.log(err);
                    err.addOrigin("pullOrigin");
                    throw err;
               })
    }

    function retrieveGroup(){
        logger.debug("---------Retrieve Group---------")
        return populate(Group.model, lists.Group.id, lists.Group.item)
               .then(function(){
                    console.log("Log notes for Twice");
                    console.log(notes);
                    for (var i=0;i<lists.Group.item.length;i++){
                        notes[lists.Group.order[i]]['group'] = lists.Group.item[i].title;
                        delete notes[lists.Group.order[i]]['itemId'];
                    }
                    console.log("Log notes for Twice");
                    console.log(notes);
               })
               .catch(function(err){
                    err.addOrigin("retrieveGroup");
                    throw err;
               })
    }

    function retrieveDebt(){
        logger.debug("---------Retrieve Debt---------");
        var groupId = [];
        var groups  = [];
        return populate(Debt.model, lists.Debt.id, lists.Debt.item)
               .then(function(){
                    for (var i=0;i<lists.Debt.item.length;i++){
                        notes[ lists.Debt.order[i] ].amount = lists.Debt.item[i].amount;
                        groupId.push( lists.Debt.item[i].group );
                    }
                    return populate(Group.model, groupId, groups)
                            .catch(function(err){
                                err.addOrigin("retrieve group");
                                throw err;
                            })
               })
               .then(function(){
                    for (var i=0;i<groups.length;i++){
                        notes[ lists.Debt.order[i] ]['group'] = groups[i].title;
                        delete notes[ lists.Debt.order[i] ]['itemId'];
                    }
               })
               .catch(function(err){
                    err.addOrigin("retrieveDebt");
                    throw err;
               })
    }

    function retrieveBill(){
        logger.debug("---------Retrieve Bill---------");
        console.log(data.response.notifications);
        var groupId = [];
        var groups = [];
        return populate(Bill.model, lists.Bill.id, lists.Bill.item)
               .then(function(){
                    for (var i=0;i<lists.Bill.item.length;i++){
                        notes[ lists.Bill.order[i] ].amount = lists.Bill.item[i].amount;
                        groupId.push( lists.Bill.item[i].group );
                    }
                    return populate(Group.model, groupId, groups)
                            .catch(function(err){
                                err.addOrigin("retrieve group");
                                throw err;
                            })
               })
               .then(function(){
                    for (var i=0;i<groups.length;i++){
                        notes[ lists.Bill.order[i] ]['group'] = groups[i].title;
                        delete notes[ lists.Bill.order[i] ]['itemId'];
                    }
               })
               .catch(function(err){
                    err.addOrigin("retrieveBill");
                    throw err;
               })
    }
}