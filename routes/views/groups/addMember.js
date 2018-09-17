var keystone = require("keystone"),
    User = keystone.list("User"),
    Group = keystone.list("Group"),
    Errors = require("../../lib/error"),
    retrieveItem = require("../../lib/retrieveItem"),
    updateItem = require("../../lib/updateItem"),
    pushNotification = require("../../lib/pushNotifications"),
    errorHandler = require("../../lib/errorHandler");
/*
    token: for user id
    target: id of the future member
    groupId: id of group
*/

exports = module.exports = function(req, res){
    var data = {
        groupId: req.body.groupId,
        target: req.body.target,
        user: req.user
    };

    retrieveGroup(data)
    .then(checkDuplicate)
    .then(retrieveUser)
    .then(addMember)
    .then(notify)
    .then(function(data){
        res.apiResponse(data);
    })
    .catch(function(err){
        if (!err.customized)
            return logger.error(err);
        err.addOrigin('addMember');
        err.addRes(res);
        throw err;
    })
    .catch(errorHandler);
}

function retrieveGroup(data){
    return retrieveItem(Group, data.groupId, [])
           .then(function(group){
                delete data.groupId;
                data.group = group;
                return data;
           })
           .catch(function(err){
                err.addOrigin("retrieveGroup");
                throw err;
           })
}

function checkDuplicate(data){
    for (var i=0;i<data.group.eMembers;i++){
        if (data.group.eMembers[i] == data.target)
            throw new Errors.InvalidParameter("target", data.target, "checkDuplicate");
    }    
    for (var i=0;i<data.group.members;i++){
        if (data.group.members[i] == data.target)
            throw new Errors.InvalidParameter("target", data.target, "checkDuplicate");
    }
    return data;
}

function retrieveUser(data){
    return retrieveItem(User, data.target, [])
            .then(function(targetUser){
                data.target = targetUser;
                return data;
            })
            .catch(function(err){
                err.addOrigin("retrieveUser");
                throw err;
            })
}

function addMember(data){
    data.group.eMembers.push(data.target._id);
    return updateItem(Group.model, data.group)
           .then(function(group){
                data.group = group;
                return data;
           })
           .catch(function(err){
                err.addOrigin("updateItem");
                throw err;
           })
}

function notify(data){
    var template = {
        type: "Group",
        itemId: data.group._id,
        initiator: data.user._id
    };
    return pushNotification(template, [data.target])
           .then(function(){ return data;})
           .catch(function(err){
                err.addOrigin("notify");
                throw err;
           })
}

//STEP 1: Retrieve Group (throw GroupNotFound Exception)
//STEP 1.5: Check if the user is already in the group
//STEP 2: Retrieve User (throw UserNotFound Exception)
//STEP 3: Add User into group eMembers field
//STEP 4: Push Notification