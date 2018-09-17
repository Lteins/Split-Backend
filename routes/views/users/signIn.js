var keystone = require("keystone"),
    User = keystone.list("User"),
    oauth = require("../../lib/auth"),
    errorHandler = require("../../lib/errorHandler");
//POST: /api/signIn
// email:
// password: 


exports = module.exports = function(req, res){
    oauth.authorization(req.body.email, req.body.password)
    .then(function(token){
        logger.info("Sign in Successfully;");
        logger.debug("TOKEN: " + token);
        res.apiResponse({'token': token});
    })
    .catch(function(err){
        logger[err.level](err.message);
        res.apiError(err.message, err);
    });
}