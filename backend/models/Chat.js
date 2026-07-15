const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure exactly 2 members
chatSchema.path('members').validate(function (members) {
  return members.length === 2;
}, 'A chat must have exactly 2 members');

// Index for finding chats by member
chatSchema.index({ members: 1 });

module.exports = mongoose.model('Chat', chatSchema);
