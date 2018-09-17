exports = module.exports = function(err) {
    var res = err.res;
    

    var original = err;
    if (!err.customized) 
        logger.error(err);

    var report = "\n--------------- Error Logging ---------------";
    var position = "";
    var title = "";

    while(err){
        if (err.customized){
            title = "Due to " + err.constructor.name;
            position = "At ";
            while(err.origins.length > 0) {
                position = position + err.origins.pop() + ".";
            }
            report = report + "\n" + title + "\n" + position + "\n" + err.message();
            err = err.causedBy;
        } else {
            report = report + "\n" + JSON.stringify(err);
            err = null;
        }
    }
    report = report + "\n--------------- Finish Logging ---------------";
    logger[original.level](report);

    delete original.causedBy;
    delete original.res;
    delete original.origins;

    res.apiError(original.message(), original);
}