var keystone = require("keystone"),
User = keystone.list("Group"),
fs = require('fs'),
updateItem = require("../../lib/updateItem"),
Errors = require("../../lib/error"),
errorHandler = require("../../lib/errorHandler");

exports = module.exports = function(req, res){
    var data = {
        user: req.user,
        img: req.files.uploadImg
    };

    paramValidation(data)
    .then(replaceFile)
    .then(updateUser)
    .then(function(group){
        res.apiResponse("Image Upload Successful");
    })
    .catch(function(err){
        console.log(err);
        err.addOrigin("updateUserImg");
        err.addRes(res);
    })
    .catch(errorHandler);

}

function paramValidation(data){
    return new Promise(function (resolve,reject){
        logger.debug("Begin Param Validation");
        var suffix = data.img.path.split(".");
        suffix = suffix[suffix.length-1];
        if (suffix!="jpg" && suffix!="png" && suffix!="jpeg")
            reject(new Errors.InvalidParameter('img', data.img.path, 'paramValidation'));
        resolve(data);     
    })
}

function replaceFile(data){
    logger.debug("replaceFile Begin");
    var tmpPath = data.img.path;
    var targetPath = "./public/uploads/" + data.user._id + ".png";
    return new Promise(function(resolve, reject){
        fs.rename(tmpPath, targetPath, function(err){
            if (err)
                reject(new Errors.FileSystemError(tmpPath, targetPath, err, 'replaceFile'));
            resolve(data);
        })
    }) 
}

function updateUser(data){
    logger.debug("Begin Update User");
    data.user.ifImg = true;
    return updateItem(User.model, data.user);
}
