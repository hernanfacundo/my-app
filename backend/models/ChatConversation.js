const mongoose = require('mongoose');

const ChatConversationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  messages: [{ type: String }],
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatConversation', ChatConversationSchema);