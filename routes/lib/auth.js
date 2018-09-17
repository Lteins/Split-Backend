var keystone = require("keystone"),
error = require("./error"),
User = keystone.list("User"),
uuid = require("uuid/v1");

var authTable = null;
exports.initialize = function () {
    if (!authTable) {
        authTable = {lastRefresh: Date.now(),
                    pairs:{},
                    pairsReverse: {}};
        setInterval(refresh, 3600*1000);
    } else{
        logger.warn("AuthTable has already been initialized");
    }
}



/*Exchange Email, password for token
  Error Type:
    error while searching user
    user not found
    Fail to match password
    password not match

  return Promise with token
*/
exports.authorization = function (email, password) {
    logger.debug("Begin Authorization");
    if (authTable) {   
        return User.model.findOne({'email': email})
        .exec()
        .then(function (user) {
            logger.debug(user);
            return new Promise(function(resolve, reject){
                if (user){
                    logger.debug("Compare Password");
                    user._.password.compare(password, function(err, result){
                        logger.debug(err);
                        logger.debug(result);
                        if (err) {
                            reject ({
                                'message': "Fail to match password",
                                'origin': 'authorization',
                                'level': 'error',
                                'detail': err
                            }); 
                        }
                        if (result) {
                            resolve(generateId(user["_id"]));
                        } else{

                            reject({
                                'message': 'password not match',
                                'origin': 'authorization',
                                'level': 'warn'
                            });
                        }
                    })
                } else {
                    reject ({'message': 'User not found', 
                            'origin': 'authorization',
                             'level': 'warn'});
                }                
            })
        }, function(err){
            throw new error.FindError(email, "User", "authorization", err);
        })
    } else{
        return new Promise(function(resolve, reject){
            reject({'message':'Please first initialize AuthTable',
                    'origin': 'authorization',
                    'level': 'warn'});
        })
    }
}


exports.authentication = function (token) {
    if (authTable) {
        var data = authTable.pairs[token];
        if (data)
            return data.id;
        else
            return null;
    } else{
        throw {'message':'Please first initialize AuthTable',
                    'origin': 'authorization',
                    'level': 'warn'};
    }
}

function refresh() {
    var now = Date.now();
    for (var x in authTable.pairs){
        if (now>authTable.pairs[x].expire){
            var userId = authTable.pairs[x].id;
            delete authTable.pairs[x];
            delete authTable.pairsReverse[userId];
        }
    }
    authTable.lastRefresh = now;
}

function generateId(userId) {
    var token = authTable.pairsReverse[userId];
    if (token)
        return token;
    token = uuid();
    authTable.pairs[token] = {'id': userId, 'expire': Date.now() + 3600*1000};
    authTable.pairsReverse[userId] = token;
    return token;
}

exports.display = function(){
    logger.debug("\n" + "-------------AuthTable-------------" + "\n" +
                             JSON.stringify(authTable) + "\n" + 
                 "-------------AuthTable-------------");
}

