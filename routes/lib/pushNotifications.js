var keystone = require("keystone"),
    User = keystone.list("User"),
    Notification = keystone.list("Notification"),
    updateItem = require("./updateItem"),
    async = require("async");
exports = module.exports = function(template, userLists){
return new Promise(function(resolve, reject){
    var pushTasks = [];
    var errList = [];
    userLists.forEach(function(user){
        pushTasks.push(function(done){
            template.toWhom = user._id;
            (new Notification.model(template)).save()
            .then(function(notification){
                logger.debug("Successfully Create Notification: " 
                    + "\n" + JSON.stringify(notification));
                user.notifications.push(notification._id);
                return updateItem(User.model, user);
            }, function(err){
                errList.push(new Errors.SaveError(template, 'Notification', 'pushNotification', err));
                done();
            })
            .then(function(user){
                done();
            }, function(err){
                err.addOrigin('pushNotifications');
                errList.push(err);
                done();
            })   
        });
    });
    async.parallel(pushTasks, function(err){
        if (err)
            reject(new Errors.ParallelInterruption('pushNotifications', err));              

        if (errList.length>0)
            reject(new Errors.ParallelPartialFail(errList, 'pushNotifications'));
        resolve();
    });
});
}