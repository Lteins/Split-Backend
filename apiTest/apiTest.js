var FormData = require('form-data');
var http = require('http');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'debug';
var fs = require('fs');

var userA = {
  name: 'A',
  email: 'A@mail.com',
  password: '111'
};
var userB = {
  name: 'B',
  email: 'B@mail.com',
  password: '111'
};
var userC = {
  name: 'C',
  email: 'C@mail.com',
  password: '111'
};
var group = null;
var bill = null;
var date = new Date();
var dateData = JSON.parse( JSON.stringify(date));
po('createUser', userA) //createA
.then(function(res){
  userA = res.user;
  return po('createUser', userB); //createB 
})
.then(function(res){
  userB = res.user;
  return po('createUser', userC); //createC
})
.then(function(res){
  userC = res.user;
  return po('signIn', {'email': userA.email, 'password': '111'}); //A signIn
})
.then(function(res){
  userA.token = res.token;
  return po('createGroup', {    //A createGroup
    token: userA.token
  });
})
.then(function(res){
  group = res.group;  
  return po('signIn', {'email': userB.email, 'password': '111'}); //B signIn
})
.then(function(res){
    userB.token = res.token;
    return po('signIn', {'email': userC.email, 'password': '111'}); //C signIn
})
.then(function(res){
    userC.token = res.token;
    return po("addMember", {token: userA.token, groupId: group._id, target: userB._id}); //A add B
})
.then(function(res){
    return po("addMember", {token: userA.token, groupId: group._id, target: userC._id}) //A add C
})
.then(function(res){
    return po('getUserById', {token: userA.token}); //refresh A
})
.then(function(res){
    userA.notifications = res.user.notifications;
    return po('getUserById', {token: userB.token}); //refresh B
})
.then(function(res){
    userB.notifications = res.user.notifications;
    return po('getUserById', {token: userC.token}); //refresh C
})
.then(function(res){
    userC.notifications = res.user.notifications;
    return po('reply',{token: userB.token, id: userB.notifications[0], response: 0}); //B reply
})
.then(function(res){
   return po('reply',{token: userC.token, id: userC.notifications[0], response: 0});  //C reply
})
.then(createBill)
.then(createBill)
.then(addDate)
.then(createBill)
.catch(function(err){
    logger.warn("\n" + JSON.stringify(err));
})

function createBill(res){

return  po('createBill', {token: userA.token, group: group._id, amount: 10, eParticipants: userB._id + ";" +userC._id, date: dateData})
    .then(function(res){
        return po('getSuspended', {token: userB.token});
    })
    .then(function(res){
        userB.notifications = res.notifications;
        return po('reply', {token: userB.token, id: userB.notifications[0]._id, response: 0});
    })
    .then(function(res){
        return po('getSuspended', {token: userC.token});
    })
    .then(function(res){
        userC.notifications = res.notifications;
        return po('reply', {token: userC.token, id: userC.notifications[0]._id, response: 0});
    });
}

function addDate(res){
    date.setDate(date.getDate() + 1);
    dateData = JSON.parse( JSON.stringify(date) );
    return res;
}

function signin(user){
    return po("signIn", {
        email: user.email,
        password: user.password
    })
    .then(function(res){

    })
} 


function po(api, data){
  return new Promise(function(resolve, reject){
    var form = new FormData();
    for(var x in data){
      form.append(x, data[x]);
    }

    form.submit('http://localhost:3000/api/' + api, function(err, res){
      if (err){
        logger.error("\n" + err);
        return reject(err);
      }
      var result = '';

      res.on('data', function (chunk) {
        result += chunk;
      });

      res.on('end', function () {
        result = JSON.parse(result);
        if (result.error) { 
          logger.warn("\n" + result.error + "\n" + JSON.stringify(result.detail));
          return reject(result);
        }
        logger.info("\n" + JSON.stringify(result));
        return resolve(result);
      });

      res.on('error', function (err) {
        logger.warn("\n" + err);
        reject(err);
      })
    })
  });

}