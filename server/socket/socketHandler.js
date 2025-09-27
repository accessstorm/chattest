const Message = require('../models/Message');
const User = require('../models/User');

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

  // Send message
  socket.on('sendMessage', async (data) => {
    try {
      const { receiverId, content } = data;
      const senderId = socket.userId;

      // Validation
      if (!receiverId || !content) {
        socket.emit('error', { message: 'Receiver ID and content are required' });
        return;
      }

      if (content.trim().length === 0) {
        socket.emit('error', { message: 'Message content cannot be empty' });
        return;
      }

      // Check if receiver exists
      const receiver = await User.findById(receiverId);
      if (!receiver) {
        socket.emit('error', { message: 'Receiver not found' });
        return;
      }

      // Create message
      const message = new Message({
        senderId,
        receiverId,
        content: content.trim()
      });

      await message.save();

      // Populate the message with user data
      await message.populate([
        { path: 'senderId', select: 'username' },
        { path: 'receiverId', select: 'username' }
      ]);

      // Emit to sender and receiver
      const senderSocket = getUserSocket(senderId);
      const receiverSocket = getUserSocket(receiverId);

      if (senderSocket) {
        io.to(senderSocket).emit('newMessage', message);
      }
      if (receiverSocket) {
        io.to(receiverSocket).emit('newMessage', message);
      }
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
      const message = await Message.findById(messageId);
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
        { path: 'receiverId', select: 'username' }
      ]);

      // Emit to both users
      const senderSocket = getUserSocket(message.senderId);
      const receiverSocket = getUserSocket(message.receiverId);

      console.log('Emitting messageUpdated to sender:', senderSocket, 'receiver:', receiverSocket);

      if (senderSocket) {
        io.to(senderSocket).emit('messageUpdated', message);
      }
      if (receiverSocket) {
        io.to(receiverSocket).emit('messageUpdated', message);
      }
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
      const message = await Message.findById(messageId);
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
        { path: 'receiverId', select: 'username' }
      ]);

      // Emit to both users
      const senderSocket = getUserSocket(message.senderId);
      const receiverSocket = getUserSocket(message.receiverId);

      console.log('Emitting messageDeleted to sender:', senderSocket, 'receiver:', receiverSocket);

      if (senderSocket) {
        io.to(senderSocket).emit('messageDeleted', message);
      }
      if (receiverSocket) {
        io.to(receiverSocket).emit('messageDeleted', message);
      }
    } catch (error) {
      console.error('Delete message error:', error);
      socket.emit('error', { message: 'Failed to delete message' });
    }
  });

  // Mark messages as read
  socket.on('markAsRead', async (data) => {
    try {
      const { otherUserId } = data;
      const currentUserId = socket.userId;

      // Mark all unread messages from otherUserId to currentUserId as read
      await Message.updateMany(
        {
          senderId: otherUserId,
          receiverId: currentUserId,
          isRead: false
        },
        {
          isRead: true,
          readAt: new Date()
        }
      );

      // Notify the sender that their messages were read
      const senderSocket = getUserSocket(otherUserId);
      if (senderSocket) {
        io.to(senderSocket).emit('messagesRead', { 
          readerId: currentUserId,
          readAt: new Date()
        });
      }
    } catch (error) {
      console.error('Mark as read error:', error);
      socket.emit('error', { message: 'Failed to mark messages as read' });
    }
  });

  // Get unread message count
  socket.on('getUnreadCount', async (data) => {
    try {
      const currentUserId = socket.userId;
      const unreadCount = await Message.countDocuments({
        receiverId: currentUserId,
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
