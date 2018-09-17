var keystone = require("keystone"),
    Bill = keystone.list("Bill"),
    Group = keystone.list("Group"),
    User = keystone.list("User"),
    populate = require("../../lib/populate"),
    updateItem = require("../../lib/updateItem"),
    pushNotifications = require("../../lib/pushNotifications"),
    cleanBill = require("../groups/cleanBill");

//Post: /api/createBill
/*-------------------------------------------------------
Need authorization
Parameter:
    token: stands for creator's id (The User retreived must be part of the group where the bill is created)
    participants: Expected Participants (Required) id referred to the participants
    group: id referred to the context of the bill
    amount
    type: 0 - 机票 (Optional)
          1 - 下午茶
          2 - 早饭
          3 - 车费
          4 - 宾馆
          5 - 未定义
    date: Date Object (Optional)
    description: String (Optional)
------------------------------------------------------- */

var typeMap = ['Plane', 'Traffic', 'Delicacy', 'Coffee', 'Food', 'Play', 'Shopping', 'Ticket', 'Hotel', 'Unknown'];
exports = module.exports = function(req, res){

  var newBill = {
    'participants': req.body.participants?req.body.participants.split(';'):[],
    'group': req.body.group,
    'type': req.body.type<typeMap.length?typeMap[req.body.type]:'Unknown',
    'amount': req.body.amount,
    'payer': req.user['_id'],
    'description': req.body.description,
    'date': req.body.date?(new Date(req.body.date)):null
  };

  var response = {};
  for (var x in newBill){
    if (!newBill[x])
      delete newBill[x]
  }

  var participants = [];
  pop(newBill, participants)
  .then(function(group){
    if (!validate(newBill, req.user, group)){
      throw {
        'message': 'Validation Fail',
        'origin': 'Create Bill',
        'level': 'warn'
      };
    }
    return createBill(newBill)
  })
  .then(function(bill){
    response.bill = bill;
    return bindWithGroup(bill);
  })
  .then(function(bill){return notify(participants, bill);})
  .then(function(){return res.apiResponse(response);})
  .catch(function(err){
      logger.debug(err);
      logger[err.level](err.message);
      res.apiError(err.message, err);
  })
}



//STEP 1:
function pop(newBill, participants){
  return populate(User.model, newBill.participants, participants)
  .then(function(){
    newBill.participants = [];
    for (var i=0;i<participants.length;i++){
      newBill.participants.push(participants[i]._id);
    }
    return   Group.model.findOne({'_id': newBill.group})
            .exec()
            .then(function(groupItem){
              if (groupItem) {
                newBill.group = groupItem._id;
                return groupItem;
              } else{
                throw { 'message': 'group not found',
                        'origin': "Create Bill",
                        'level': "warn"
                };
              }
            }, function(err){
                throw {
                  'message': 'error while seeking for bill',
                  'origin': "Create Bill",
                  'level': 'error',
                  'detail': err
                };
            });
  });
}


//STEP 2:
function validate(newBill, initiator, group){
  function include(value, range){
    logger.debug("Value: " + value);
    logger.debug("Range: " + range[0] + " " + range[1]);
    if (!range)
      return false;
    logger.debug("FOR LOOP: ");
    for (var i=0;i<range.length;i++){
      if (JSON.stringify(value) == JSON.stringify(range[i]))
        return true;
    }
    return false;
  }
  function contain(domain, range){
    if (!domain) 
      return true;
    for (var i=0;i<domain.length;i++) {
      if (!include(domain[i], range))
        return false
    }
    return true;
  }
  logger.debug("Initiator: " + initiator);
  logger.debug("Group Member: " + group.members);
  logger.debug("Include: " + include(initiator._id, group.members));
  logger.debug("Contain: " + contain(newBill.participants, group.members));
  return  include(initiator._id, group.members)
          && contain(newBill.participants, group.members);
}
 
//STEP 3:
function createBill(newBill) {
  return Bill.model(newBill).save()
  .then(function(bill){
    logger.debug("Bill Created Successfully: " + "\n" + JSON.stringify(bill));
    return bill;
  }, function(err){
    console.log(newBill);
    throw {
      'message': 'error saving bill',
      'origin': 'Create Bill',
      'level': 'error',
      'detail': err
    }
  });
}

//STEP 4:
function bindWithGroup(bill) {
  return Group.model.findOne({'_id': bill.group})
  .exec()
  .then(function(group){
    if (group){
      group.bills.push(bill['_id']);
      return updateItem(Group.model, group);
    }else{
      throw {
        'message': 'cannot find group',
        'origin': 'Create Bill',
        'level': 'error'
      };
    }
  }, function(err){
    throw {
      'message': 'fatal error while searching group',
      'origin': 'Create Bill',
      'level': 'error',
      'detail': err
    };
  })
  .then(function(group){return bill});
}

//STEP 5:
function notify(userLists, bill){
  var template = {
    'type': 'Bill',
    'initiator': bill.payer,
    'amount': bill.amount,
    'itemId': bill._id
  };
  return pushNotifications(template, userLists);
}

/* 1. Pop Group, participants
   2. Validate
        a. The initiator is in the group
        b. The participants are in the group
        c. Date is within the range of the group
    3. Create the Bill (Put all userId except for the initiator in the eParticipants field)
    4. Update
        a. Update the group bill field
        b. push notification 
*/



