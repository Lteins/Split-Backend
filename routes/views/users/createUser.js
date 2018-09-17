var keystone = require("keystone"),
    User = keystone.list("User"),
    Errors = require("../../lib/error"),
    errorHandler = require("../../lib/errorHandler");

//POST: /api/createUser
/* ---------------------------
Form-Data
Body:  name: String
            email: String
            password: String
Retrun Type:
    Error:
        1. Validatioin Fail (Info Miss OR User Duplicate)
        2. Error occured while doing validation (FATAL)
        3. Error occured while saving new User (FATAL)
    Data:
        "success": true/false
        'user': user info object
   --------------------------- */ 
exports = module.exports = function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    var newUser = {
        email: req.body.email,
        password: req.body.password,
        name: req.body.name
    };
    validate(newUser) //Validate
    .then(function(foo){ //Create User
        var userInstance = new User.model(newUser);
        return userInstance.save();
    })
    .then(function(newUser){ // Send Feedback
        logger.info("New User Created successfully" + "\n"
                + JSON.stringify(newUser));
        res.apiResponse({
            'success': true,
            'user': newUser 
        });
    }, function (err) {
        if (!err.customized)
            throw new Errors.SaveError(newUser, 'User', 'createUser', err);
        else 
            throw err;
    })
    .catch(function(err){
        if (err.constructor == Errors.InfoMiss) {
            var newError = new Errors.InvalidParameter(err.missedArea[0], null, 'createUser');
            newError.chain(err);
            newError.addRes(res);
            throw newError;
        } else if (err.constructor == Errors.UserDuplication) {
            var newError = new Errors.InvalidParameter('email', req.body.email, 'createUser');
            newError.chain(err);
            newError.addRes(res);
            throw newError;
        } else if (err.constructor == Errors.FindError || err.constructor == Errors.SaveError) {
            err.addOrigin("createUser");
            err.addRes(res);
            throw err;
        }  else {
            logger.error(err);
        }      
    })
    .catch(errorHandler);
}

function validate(newUser){
    logger.debug("User Validation");
    if (newUser.email && newUser.password && newUser.name) {
        logger.debug("Validation Success");
        return checkUserDuplicate(newUser.email);
    } else{
        logger.debug("Validation Fail");
        return new Promise((resolve, reject) => {
            logger.debug("Throw Validatioon Error");
            var info = {
                'email': newUser.email,
                'password': newUser.password,
                'name': newUser.name
            }
            var err = new Errors.InfoMiss(info, 'validate');
            reject(err);
        });
    }
}


function checkUserDuplicate(email){
    logger.debug("Check Duplicate User");
    return User.model.findOne({'email': email})
    .exec()
    .then(function(user){
        if (user){
            throw new Errors.UserDuplication(user, 'checkUserDuplicate');
        }else{
            return null;
        }
    }, function(err){
        throw Errors.FindError(email, 'User', 'checkUserDuplicate', err);
    });
}