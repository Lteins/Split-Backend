var keystone = require("keystone"),
    Group = keystone.list("Group"),
    fs = require('fs'),
    updateItem = require("../../lib/updateItem"),
    Errors = require("../../lib/error"),
    errorHandler = require("../../lib/errorHandler");

exports = module.exports = function(req, res){
    var data = {
        user: req.user,
        groupId: req.body.groupId,
        img: req.files.uploadImg
    };
    paramValidation(data)
    .then(retrieveGroup)
    .then(replaceFile)
    .then(updateGroup)
    .then(function(group){
        res.apiResponse("Image Upload Successful");
    })
    .catch(function(err){
        err.addOrigin("updateGroupImg");
        err.addRes(res);
    })
    .catch(errorHandler);
}

function paramValidation(data){
    logger.debug("paramValidation begin");
    return new Promise(function(resolve, reject){
        var suffix = data.img.path.split(".");
        suffix = suffix[suffix.length-1];
        if (suffix!="jpg" && suffix!="png" && suffix!="jpeg")
            reject(new Errors.InvalidParameter('img', data.img.path, 'paramValidation'));
        if (!data.groupId)
            reject(new Errors.InfoMiss(data, 'paramValidation'));
        if (!priveledge())
            reject(new Errors.InvalidParameter('groupId', data.groupId, 'paramValidation'));
        resolve(data);
        function priveledge(){
            for (var i=0;i<data.user.groups.length;i++) {
                if (data.user.groups[i] == data.groupId)
                    return true;
            }
            return false;
        }
    })
}

function retrieveGroup(data){
    logger.debug("retireveGroup Begin");
    return Group.model.findOne({'_id': data.groupId}).exec()
    .then(function(group){
        if (!group)
            throw new Errors.ItemNotFound(data.groupId, 'Group', 'retrieveGroup', 'error');
        delete data.groupId;
        data.group = group;
        return data;
    }, function(err){
        throw new Errors.FindError(groupId, 'Group', 'retrieveGroup', 'error');
    })
}

function replaceFile(data){
    logger.debug("replaceFile Begin");
    var tmpPath = data.img.path;
    var targetPath = "./public/uploads/" + data.group._id + ".png";
    return new Promise(function(resolve, reject){
        fs.rename(tmpPath, targetPath, function(err){
            if (err)
                reject(new Errors.FileSystemError(tmpPath, targetPath, err, 'replaceFile'));
            resolve(data);
        })
    }) 
}

function updateGroup(data){
    logger.debug("updateGroup Begin");
    data.group.ifImg = true;
    return updateItem(Group.model, data.group);
}