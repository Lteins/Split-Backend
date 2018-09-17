var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Bill Model:
 * Title: select between several pre-defined values (optional: default value with "undefined")
 * Amount: numerical value (mandatory)
 * Date: Date type (optional: default value set as the date created)
 * Payer: many-2-one relationship with User (Creator of the Bill)
 * Expected Participants: many-2-many relationship with User (at least have one member other than the payer)
 * Participants: many-2-many relationship with User (initialized as empty)
 * Description: Optional
 * Splitted: boolean
 * ==========
 */

var Bill = new keystone.List('Bill');

Bill.add({
    type: {type: Types.Select, options: 'Plane, Traffic, Delicacy, Coffee, Food, Play, Shopping, Ticket, Hotel, Unknown', required: true, default: 'unknown'},
    amount: {type: Types.Number, required: true, initial: true},
    date: {type: Date, default: new Date()},
    payer: {type: Types.Relationship, ref:'User', required: true, many: false, initial: true},
    eParticipants: {type: Types.Relationship, ref:'User', required: true, many:true, initial: true},
    participants: {type: Types.Relationship, ref:'User', required: false, many: true},
    description: {type: String, required: false},
    group: {type: Types.Relationship, ref: 'Group', required: true, many: false, initial: true},
    splitted: {type: Types.Select, options: "true, false", required: true, default: false}
})


/**
 * Registration
 */
Bill.register();
