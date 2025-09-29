const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  isGroupChat: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    required: function() {
      return this.isGroupChat;
    },
    trim: true,
    maxlength: 50
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.isGroupChat;
    }
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true
});

// Index for efficient querying
conversationSchema.index({ participants: 1, updatedAt: -1 });

// Virtual to get the other participant in one-on-one chats
conversationSchema.virtual('otherParticipant').get(function() {
  if (!this.isGroupChat && this.participants.length === 2) {
    // This will be populated when needed
    return this.participants.find(p => p._id.toString() !== this._doc.currentUserId);
  }
  return null;
});

module.exports = mongoose.model('Conversation', conversationSchema);
