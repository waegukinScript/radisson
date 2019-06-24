const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  CheckIn: String,
  CheckOut: String,
  Guests: String,
  createdAt: String
}, { timestamps: true });


const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
