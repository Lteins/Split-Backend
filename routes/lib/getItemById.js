//fetch item of any model type and return it through api endpoint
exports = module.exports = function (Model, id, popField, res) {
    logger.debug("Begin Fetch Item of type:" + Model.model.modelName + " with id of " + id);
    Model.model.findOne({"_id": id})
    .populate(popField)
    .exec()
    .then(function(item){
        logger.info("Fetch item by id succeeds");
        logger.info(JSON.stringify(item));
        var response = {};
        response[Model.model.modelName.toLowerCase()] = item;
        res.apiResponse(response);
    }, function(err){
        log.warn("Error occur while fetching bill by id");
        log.warn(JSON.stringify(err));
    });
}