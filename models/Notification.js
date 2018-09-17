var keystone = require('keystone');
var Types = keystone.Field.Types;

/** TODO: Amount field
 * Notification Model:
 * type: "Group" / "Bill" / "Debt" 
 * amount: Only available when the type is "Debt" (TODO: Need to be forced in the schema level)
 * date: Date type (optional: default value set as the date created)
 * initiator: many-2-one relationship with User 
    "Group": the creator of the group
    "Bill": the creator(payer) of the bill
    "Debt": lender
 * toWhom: many-2-one relationship with User
    "Group": the potential members of the group
    "Bill": the potnetial payer of the group
    "Debt": borrower
 * status: "suspend" / "resolve" / "reject"
    "Debt":  don't have "reject" option
 * ==========
 */

 var Notification = new keystone.List("Notification");

 Notification.add({
    type: {type: Types.Select, options: 'Group , Bill, Debt', required: true, initial: true},
    itemId: {type: String, required: true, initial: true},
    amount: {type: Number, required: false},
    date: {type: Date, default: new Date()},
    initiator: {type: Types.Relationship, ref: 'User', many: false, required: true, initial: true},
    toWhom: {type: Types.Relationship, ref: 'User', many: false, required: true, initial: true},
    status: {type: Types.Select, options: 'suspend, resolve, reject', default: 'suspend'}    
 });

 Notification.register();