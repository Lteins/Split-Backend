var keystone = require("keystone"),
    Group = keystone.list("Group"),
    User = keystone.list("User"),
    Notification = keystone.list("Notification"),
    populate = require("../../lib/populate"),
    updateItem = require("../../lib/updateItem"),
    pushNotifications = require("../../lib/pushNotifications"),
    async = require("async");

//Post: /api/createGroup
/* -------------------------------------------------------
Need Authorization
Parameter: 
    token: stands for creator's id
    title: String (Optional)
    photo: (Optional) Yet to be handled
    destination: (Optional) String
    startDate: (Optional) Stringified Date Type
    endDate: (Optional) Stringified Date Type
    eMembers: (Optional) (excluding the creator)
    
    Error Type
        Authorization: 
            Invalid UserId (Error)
            Error when searching for User (Error)
            Invalid Token (Warn)
        Invalid Parameter
            participants do not exist (Warn)
            Error when seeking for participants (Warn)


    FYI:
    Javascript Date Object
    In client side:
    var d = new Date();
    d = JSON.parse ( JSON.stringify(d) );
    Send d
   ------------------------------------------------------- */

exports = module.exports = function(req, res) {
    logger.debug("Start Create Group");
    var newGroup = {
        title: req.body.title?(req.body.title):"Please Input Title",
        destination: req.body.destination,
        startDate: req.body.startDate?(new Date(req.body.startDate)):null,
        endDate: req.body.endDate?(new Date(req.body.endDate)):null,
        eMembers: req.body.eMembers?req.body.eMembers.split(";"):[],
        members: [req.user._id],
        ifImg: validateImg(req.files.uploadImg)
    };
    for (var x in newGroup){
        if (!newGroup[x])
            delete newGroup[x];
    }
    logger.debug("\n" + "New Group Meta Data: " + "\n" + 
                JSON.stringify(newGroup));

    var usersList = [];
    var response = {};
    retrieveUser(newGroup, usersList)
    .then(function(){return createGroup(newGroup)})
    .then(function(group){ return replaceImg(group, req); })
    .then(function(group) {
        response = {'group': group};
        return bindGroup(group, req);})
    .then(function(group){return notify(usersList, req.user, group)})
    .then(function(){return res.apiResponse(response)})
    .catch(function(err){
        console.log(err);
        err.addOrigin('createGroup');
        err.addRes(res);
        throw err;
    })
    .catch(errorHandler);
}
function validateImg(img){
        if (!img)
            return false;
        var suffix = img.path.split(".");
        suffix = suffix[suffix.length-1];
        return suffix=="jpg" || suffix=="png" || suffix!="jpeg";
}


//STEP 0: Retrieve User info, exclude the user that
function retrieveUser(newGroup, userLists) {
    logger.debug("Start Retrieve User");
    return populate(User.model, newGroup.eMembers, userLists)
           .catch(function(err){
                if (err.constructor == Errors.ParallelPartialFail) {
                    var problemId = [];
                    for (var i=0;i<err.errList.length;i++) { 
                        var subErr = err.errList[i];
                        if (subErr.constructor ==Errors.ItemNotFound)
                            problemId.push(subErr.id);
                    }
                    if (problemId.length > 0){
                        var newError = new Errors.InvalidParameter('eMembers', JSON.stringify(problemId), 'retrieveUser');
                        newError.chain(err);
                        throw newError;
                    }
                } 
                err.addOrigin('retrieveUser');
                throw err;
           })
}
//STEP 1:
function createGroup(newGroup){
    logger.debug("Start Instantiate Group");
    logger.debug(JSON.stringify(newGroup));
    return (new Group.model(newGroup)).save()
    .catch(function(err){
        throw new Errors.SaveError(newGroup, 'Group', 'createGroup', err);
    })
}
//STEP 2:
function replaceImg(group, req){
    logger.debug("replaceFile Begin");

    return new Promise(function(resolve, reject){
        if (group.ifImg){
            var tmpPath = req.uploadImg.path;
            var targetPath = "./public/uploads/" + group._id + ".png";
            fs.rename(tmpPath, targetPath, function(err){
                if (err)
                    reject(new Errors.FileSystemError(tmpPath, targetPath, err, 'replaceFile'));
                resolve(group);
            })
        }else{
            //no image uploaded
            resolve(group);
        }
    }) 

}
//STEP 3:
function bindGroup(group, req) {
    logger.debug("Start bind user to group");
    if (!req.user.groups)
        req.user.groups = [];
    req.user.groups.push(group._id);
    return updateItem(User.model, req.user)
           .then(function(user){return group},
            function(err){
                err.addOrigin("bindGroup");
                throw err;
            })
}

//STEP 4: TODO: send notification to client
function notify(userLists, creator, group){
    logger.debug("Start Notify User");
    var template = {
        'type': 'Group',
        'initiator' : creator._id,
        'itemId': group._id
    };
    return pushNotifications(template, userLists)
            .catch((err)=> {
                err.addOrigin('notify');
                throw err;
            });
}


//STEP 0: Retrieve Users (probably will throw error when user doesn't exist )
    //Async
//STEP 1: Create the group (add all members to eMembers)
//STEP 2: Push Notification to User
    //a. Create a push notification -> put in user item
    //b. Send the Push Notification (Different Implementation in different platform)



//STEP 3: Update User item's group info
//Implemented in separate API endpoints in handling feedback from user notification    

//TODO: add Date validation




