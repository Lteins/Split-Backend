exports = module.exports = function (Model, item) {
    logger.debug(item);
    return new Promise((resolve, reject) => {
         Model.findByIdAndUpdate(item["_id"], item, {new: true}, function(err, item){
            if (err) {
                reject(new Errors.UpdateError(item["_id"], item, Model.modelName, 'updateItem', err));
            }else{
                logger.debug("Finish Updating Item");

                logger.debug("Before resolve the object");
                logger.debug(item);
                resolve(item);
            }
        });       
    });
}