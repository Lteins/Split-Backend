var keystone = require("keystone"),
    Types = keystone.Field.Types;

/**
* Debt Model:
* group: Relationship Field with Group
* fromWhom: Relationship Field with User
* toWhom: Relationship Field with User
* amount: Money owned
*/


var Debt = new keystone.List("Debt");

Debt.add({
    group: {type: Types.Relationship, ref: 'Group', many: false, required: true, initial: true},
    fromWhom: {type: Types.Relationship, ref: 'User', many: false, required: true, initial: true},
    toWhom: {type: Types.Relationship, ref: 'User', many: false, required: true, initial: true},
    amount: {type: Number, required: true, initial: true}
});

Debt.register();