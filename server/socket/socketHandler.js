const Message = require('../models/Message');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

// Store user ID to socket ID mapping
const userSocketMap = new Map();

const addUser = (userId, socketId) => {
  userSocketMap.set(userId.toString(), socketId);
};

const removeUser = (userId) => {
  userSocketMap.delete(userId.toString());
};

const getUserSocket = (userId) => {
  return userSocketMap.get(userId.toString());
};

const handleSocketEvents = (socket, io) => {
  // Note: userOnline/userOffline events are handled in server/index.js

  // Join conversation rooms
  socket.on('joinRooms', async (conversationIds) => {
    try {
      const userId = socket.userId;
      
      // Verify user is participant in all conversations
      const conversations = await Conversation.find({
        _id: { $in: conversationIds },
        participants: userId
      });

      // Join socket rooms for valid conversations
      conversations.forEach(conversation => {
        socket.join(conversation._id.toString());
      });

      console.log(`User ${userId} joined ${conversations.length} conversation rooms`);
    } catch (error) {
      console.error('Join rooms error:', error);
      socket.emit('error', { message: 'Failed to join conversation rooms' });
    }
  });

  // Send message
  socket.on('sendMessage', async (data) => {
    try {
      const { conversationId, content } = data;
      const senderId = socket.userId;

      // Validation
      if (!conversationId || !content) {
        socket.emit('error', { message: 'Conversation ID and content are required' });
        return;
      }

      if (content.trim().length === 0) {
        socket.emit('error', { message: 'Message content cannot be empty' });
        return;
      }

      // Check if conversation exists and user is a participant
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: senderId
      });

      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found or access denied' });
        return;
      }

      // Create message
      const message = new Message({
        senderId,
        conversationId,
        content: content.trim()
      });

      await message.save();

      // Update conversation's lastMessage
      conversation.lastMessage = message._id;
      await conversation.save();

      // Populate the message with user data
      await message.populate([
        { path: 'senderId', select: 'username' },
        { path: 'readBy', select: 'username' }
      ]);

      // Broadcast to all participants in the conversation room
      io.to(conversationId).emit('newMessage', message);
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Edit message
  socket.on('editMessage', async (data) => {
    try {
      console.log('Edit message received:', data);
      const { messageId, newContent } = data;
      const userId = socket.userId;

      // Validation
      if (!messageId || !newContent) {
        socket.emit('error', { message: 'Message ID and new content are required' });
        return;
      }

      if (newContent.trim().length === 0) {
        socket.emit('error', { message: 'Message content cannot be empty' });
        return;
      }

      // Find the message
      const message = await Message.findById(messageId).populate('conversationId');
      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // Check if user is the sender
      if (message.senderId.toString() !== userId) {
        socket.emit('error', { message: 'You can only edit your own messages' });
        return;
      }

      // Check if message is within 30 seconds
      const timeDiff = Date.now() - message.timestamp.getTime();
      if (timeDiff > 30000) { // 30 seconds
        socket.emit('error', { message: 'You can only edit messages within 30 seconds' });
        return;
      }

      // Update message
      message.content = newContent.trim();
      message.isEdited = true;
      await message.save();

      // Populate the message with user data
      await message.populate([
        { path: 'senderId', select: 'username' },
        { path: 'readBy', select: 'username' }
      ]);

      // Broadcast to all participants in the conversation room
      io.to(message.conversationId._id.toString()).emit('messageUpdated', message);
    } catch (error) {
      console.error('Edit message error:', error);
      socket.emit('error', { message: 'Failed to edit message' });
    }
  });

  // Delete message
  socket.on('deleteMessage', async (data) => {
    try {
      console.log('Delete message received:', data);
      const { messageId } = data;
      const userId = socket.userId;

      // Validation
      if (!messageId) {
        socket.emit('error', { message: 'Message ID is required' });
        return;
      }

      // Find the message
      const message = await Message.findById(messageId).populate('conversationId');
      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // Check if user is the sender
      if (message.senderId.toString() !== userId) {
        socket.emit('error', { message: 'You can only delete your own messages' });
        return;
      }

      // Check if message is within 30 seconds
      const timeDiff = Date.now() - message.timestamp.getTime();
      if (timeDiff > 30000) { // 30 seconds
        socket.emit('error', { message: 'You can only delete messages within 30 seconds' });
        return;
      }

      // Mark message as deleted instead of removing it
      message.isDeleted = true;
      await message.save();

      // Populate the message with user data
      await message.populate([
        { path: 'senderId', select: 'username' },
        { path: 'readBy', select: 'username' }
      ]);

      // Broadcast to all participants in the conversation room
      io.to(message.conversationId._id.toString()).emit('messageDeleted', message);
    } catch (error) {
      console.error('Delete message error:', error);
      socket.emit('error', { message: 'Failed to delete message' });
    }
  });

  // Mark messages as read
  socket.on('markAsRead', async (data) => {
    try {
      const { conversationId } = data;
      const currentUserId = socket.userId;

      // Verify user is participant in conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: currentUserId
      });

      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found or access denied' });
        return;
      }

      // Mark all unread messages in this conversation as read
      await Message.updateMany(
        {
          conversationId: conversationId,
          senderId: { $ne: currentUserId }, // Don't mark own messages as read
          isRead: false
        },
        {
          isRead: true,
          readAt: new Date()
        }
      );

      // Notify all participants that messages were read
      io.to(conversationId).emit('messagesRead', { 
        readerId: currentUserId,
        conversationId: conversationId,
        readAt: new Date()
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      socket.emit('error', { message: 'Failed to mark messages as read' });
    }
  });

  // Mark messages as read (new implementation with readBy tracking)
  socket.on('markMessagesAsRead', async (data) => {
    try {
      const { conversationId } = data;
      const readerId = socket.userId;

      // Verify user is participant in conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: readerId
      });

      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found or access denied' });
        return;
      }

      // Find all messages in the conversation that:
      // 1. Were NOT sent by the reader (messages from other participants)
      // 2. Have not been read by the reader yet
      const messagesToUpdate = await Message.find({
        conversationId: conversationId,
        senderId: { $ne: readerId },
        readBy: { $ne: readerId }
      });

      if (messagesToUpdate.length > 0) {
        // Update all matching messages to include the reader in readBy array
        await Message.updateMany(
          {
            conversationId: conversationId,
            senderId: { $ne: readerId },
            readBy: { $ne: readerId }
          },
          {
            $addToSet: { readBy: readerId }
          }
        );

        // Notify all participants that messages were read
        io.to(conversationId).emit('messagesRead', { 
          readerId: readerId,
          conversationId: conversationId,
          readAt: new Date()
        });
      }
    } catch (error) {
      console.error('Mark messages as read error:', error);
      socket.emit('error', { message: 'Failed to mark messages as read' });
    }
  });

  // Get unread message count
  socket.on('getUnreadCount', async (data) => {
    try {
      const currentUserId = socket.userId;
      const unreadCount = await Message.countDocuments({
        conversationId: { $in: await Conversation.find({ participants: currentUserId }).distinct('_id') },
        senderId: { $ne: currentUserId },
        isRead: false
      });

      socket.emit('unreadCount', { count: unreadCount });
    } catch (error) {
      console.error('Get unread count error:', error);
      socket.emit('error', { message: 'Failed to get unread count' });
    }
  });
};

module.exports = {
  addUser,
  removeUser,
  getUserSocket,
  handleSocketEvents,
  userSocketMap
};
