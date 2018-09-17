var keystone = require("keystone"),
    User = keystone.list("User"),
    Notification = keystone.list("Notification"),
    MODEL = {'Group': keystone.list('Group').model,
              'Bill': keystone.list('Bill').model},
    USERFIELD = {'Group': 'members',
                 'Bill': 'participants'},
    EUSERFIELD = {'Group': 'eMembers',
                 'Bill': 'eParticipants'},
    Model = null,
    userField = null,
    eUserField = null,
    updateItem = require("../../lib/updateItem");


//POST: /api/reply
// Parameter: token
//            id: id of the notification
//            response:r 0 - accept 
//                    1 - decline
exports = module.exports = function(req, res){
    //Response Validation
    if (  (!req.body.hasOwnProperty('response')) || ( (parseInt(req.body.response)!=0) && (parseInt(req.body.response)!=1) )  ){ 
        var err = {
            'message': 'Response Illegal',
            'origin': 'reply',
            'level': 'warn'
        }
        logger[err.level](err.message);
        return res.apiError(err.message, err);
    }

    retrieve(req.body.id)
    .then(function(notification){
        logger.debug("Finish Retrieve");
        console.log(notification);
        return bindUser(notification, req.body.response);
    })
    .then(function(notification){
        logger.debug("Finish Binding");
        return updateUser(notification, req.user);
    })
    .then(function(notification){
        logger.debug("Finish Updating User");
        console.log(req.user);
        return alterStatus(notification, req.body.response);
    })
    .then(function(notification){
        logger.debug("Finish Altering Status");
        logger.debug(notification);
        res.apiResponse({'notification': notification});
    })
    .catch(function(err){
        logger[err.level](err.message);
        res.apiError(err.message, err);
    })
}

//STEP 1
function retrieve(id){
    return Notification.model.findOne({'_id': id})
    .exec()
    .then(function(notification){
        if (!notification)
            throw {
                'message': 'Cannot find Notification',
                'origin': 'reply',
                'level': 'error'
            }
        Model = MODEL[notification.type];
        userField = USERFIELD[notification.type];
        eUserField = EUSERFIELD[notification.type];
        return notification;
    })
    .catch(function(err){
        throw {
            'message': 'Database Error when searching for Notification',
            'origin': 'reply',
            'level': 'error',
            'detail': err            
        }
    });
}

function bindUser(notification, response){
    return Model.findOne({'_id': notification.itemId})
    .exec()
    .then(function(item){
        if (!item) 
            throw {'message': notification.type + " does not exist",
                    'origin': 'Reply',
                    'level': 'error'};
        var buff = null;
        for (var i=0;i<item[eUserField].length;i++){
            if (JSON.stringify(notification.toWhom) == JSON.stringify(item[eUserField][i])){
                buff = notification.toWhom;
                item[eUserField].splice(i,1);
                i--;
            }
        }
        if (buff){
            if (response == 0) {
                if (!item[userField])
                    item[userField] = [];
                item[userField].push(buff); 
            }
            return updateItem(Model, item);
        }else{
            throw {
                'message': 'User does not have priviledge to join the ' + notification.type,
                'userId': notification.toWhom,
                'level': 'error',
                'origin': 'Reply'
            };
        }            
    }, function(err){
        throw {
            'message': 'Database Error when seeking for ' + notification.type,
            'level': 'error',
            'origin': 'Reply',
            'detail': err
        };
    })
    .then(function(item){
        return notification;
    });
}

function updateUser(notification, user){
    return Model.findOne({'_id': notification.itemId})
    .exec()
    .then(function(item){
        console.log("Reached!");
        if (!user.groups){
            user.groups = [];
        }
        user.groups.push(item._id);
        console.log("Reached!");
        return updateItem(User.model, user);
    })
    .catch(function(err){
        err.addOrigin("Update User");
        throw err;
    })
}

function alterStatus(notification, response){
    var status = ['resolve', 'reject'];
    response = Number(response);
    notification.status = status[response];
    logger.debug("Notification: " + JSON.stringify(notification));
    return updateItem(Notification.model, notification);
}



//STEP 1: Retrieve Notification
//STEP 2: Update Group/Bill Item
//STEP 3: Update User