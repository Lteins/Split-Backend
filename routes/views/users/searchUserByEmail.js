var keystone = require("keystone"),
    User = keystone.list("User"),
    Errors = require("../../lib/error"),
    errorHandler = require("../../lib/errorHandler");

exports = module.exports = function(req, res){

    return retrieveUser({email: req.body.email})
            .then(function(data){
                console.log(data);
                var user = {};
                user.email = data.user.email;
                user.name = data.user.name;
                user.id = data.user.id;
                res.apiResponse(user);
            })
            .catch(function(err){
                err.addRes(res);
                err.addOrigin('searchUserByEmail');
            })
            .catch(errorHandler);
}

function retrieveUser(data){
    return User.model.findOne({'email': data.email}).exec()
    .then(function(user){
        if (!user)
            throw new Errors.ItemNotFound(data.email, 'User', 'retrieveUser', 'warn');
        data.user = user;
        return data;
    })
    .catch(function(err){
        throw new Errors.FindError(data.email,'User', 'retrieveUser', err);
    })
}