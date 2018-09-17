var keystone = require("keystone"),
Errors = require("../../lib/error"),
errorHandler = require("../../lib/errorHandler"),
updateItem = require("../../lib/updateItem"),
User = keystone.list("User");

exports = module.exports = function(req, res){
    //Setup input data
    var data = {
        user: req.user,
        name: req.body.name,
        type: req.body.type,
        account: req.body.account
    };
    //delete unnecessary fields
    for (var x in newGroup){
        if (!newGroup[x])
            delete newGroup[x];
    }

    updateName(data)
    .then(updatePayment)
    .then(updateUser)
    .catch(function(err){
        if (err.customized){
            err.addOrigin("updateUser");
            err.addRes(res);
            throw err;
        }else{
            console.log(err);
            return;
        }
    })
    .catch(errorHandler);
}

function updatePayment(data){
    return new Promise(function(resolve, reject){
        if (!(data.type && data.account)){
            //no need to update payment
            resolve(data);
        }
        if (data.type!="visa" && data.type!="paypal"){
            reject(new InvalidParameter("type", data.type, "updatePayment"));
        } 
        //Parse the payment field
        if (data.user.payment){
            data.user.payment = JSON.parse(data.user.payment);
        }else{
            data.user.payment = [];
        }
        data.user.payment.push({
            type: data.type,
            account: data.account
        })
        //parse payment field back
        data.user.payment = JSON.stringify(data.user.payment);
        resolve(data);
    })
}

function updateName(data){
    return new Promise(function(resolve, reject){
        data.user.name = data.name?data.name:data.user.name;
        resolve(data);
    })
}

function updateUser(data){
    return updateItem(User.model, data.user);
}



