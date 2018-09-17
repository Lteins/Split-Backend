//fetch item of any model type and return it through api endpoint
var Errors = require("./error");
exports = module.exports = function (Model, id, popField) {
    logger.debug("Begin Fetch Item of type:" + Model.model.modelName + " with id of " + id);
    return Model.model.findOne({"_id": id})
    .populate(popField)
    .exec()
    .then(function(item){
        if (!item)
            throw new Errors.ItemNotFound(id, Model.model.modelName, 'retrieveItem', 'warn');
        return item;
    }, function(err){
        throw new Errors.FindError(od, Model.model.modelName, 'retrieveItem', 'error', err);
    });
}