const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventDateIn: String,
  eventDateOut: String,
  adults: String,
  children: String,
  createdAt: String
}, { timestamps: true });


const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
