const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const schema = new Schema({
    id: { type: String },
    from: {
        address: { type: String },
        name: { type: String }
    },
    date: { type: Date },
    subject: { type: String },
    inReplyTo: { type: String },
    references: [ { type: Array } ],
    content: { type: String }
});

/* *** *** *** *** *** */
/* ***   METHODS   *** */
/* *** *** *** *** *** */
schema.methods.findSameUser = function findSameUser(cb) {
    return this.model('Message').find({ 'sender.address': this.send.address }, cb);
};

module.exports = mongoose.model('Message', schema);