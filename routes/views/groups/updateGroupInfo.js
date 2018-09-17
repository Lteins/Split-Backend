var keystone = require("keystone"),
    Errors = require("../../lib/error"),
    errorHandler = require("../../lib/errorHandler"),
    updateItem = require("../../lib/updateItem"),
    Group = keystone.list("Group");

exports = module.exports = function(req, res){
    if (!req.body.groupId) {
        var err = new InvalidParameter('groupId', null);
        err.addOrigin('updateGroupInfo');
        err.addRes(res);
        errorHandler(err);
    }

    Group.model.findOne({'_id': req.body.groupId}).exec()
    .then(function(group){
        logger.debug("Group Validation");
        if (!group){
            var err = new Errors.ItemNotFound(req.body.groupId, 'Group', 'updateGroupInfo', 'warn');
            err.addRes(res);
            throw err;
        }
        logger.debug("Assign Value")
        group.title = req.body.title?req.body.title:group.title;
        group.startDate = req.body.startDate?new Date(req.body.startDate):group.startDate;
        group.endDate = req.body.endDate?new Date(req.body.endDate):group.endDate;
        return updateItem(Group.model, group);
    }, function(err){
        var newErr = new Errors.FindError(req.body.groupId, 'Group', 'updateGroupInfo', err);
        newErr.addRes(res);
    })
    .then(function(group){
        logger.debug("Update Finish");
        res.apiResponse(group);       
    })
    .catch(errorHandler);
}