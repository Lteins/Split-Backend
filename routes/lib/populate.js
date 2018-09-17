var keystone = require("keystone"),
    async = require("async");

exports = module.exports = function(Model, IdList, itemList){
    logger.debug("Populating " + Model.modelName + " idList:" + IdList );
    return new Promise(function(resolve, reject){
        if (IdList.length == 0) resolve();

        var retrieveTasks = [];
        var newIdList = [];
        var errList = [];
        for (var i=0;i<itemList.length;i++)
            itemList.pop();
        IdList.forEach(function(id){
            retrieveTasks.push(function(done){
                Model.findOne({'_id': id})
                .exec()
                .then(function(item){
                    if (item){
                        itemList.push(item);
                        newIdList.push(id);
                        done();
                    }else {
                        throw new Errors.ItemNotFound(id, Model.modelName, 'populate', 'warn');
                    }
                }, function(err){
                    throw new Errors.FindError(id, Model.modelName, 'populate', err);
                })
                .catch(function(err){
                    if (err.customized)
                        errList.push(err);
                    done();
                })
            });
        });

        async.parallel(retrieveTasks, function(err){
            IdList = newIdList;
            if (err)
                reject(new Errors.ParallelInterruption('populate', err));              
            if (errList.length>0){
                reject(new Errors.ParallelPartialFail(errList, 'populate'));
            }
            resolve();
        })        
    })
}