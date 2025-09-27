import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io('http://localhost:5000', {
      auth: {
        token: token
      }
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Message events
  sendMessage(receiverId, content) {
    if (this.socket) {
      this.socket.emit('sendMessage', { receiverId, content });
    }
  }

  editMessage(messageId, newContent) {
    if (this.socket) {
      console.log('Emitting editMessage:', { messageId, newContent });
      this.socket.emit('editMessage', { messageId, newContent });
    }
  }

  deleteMessage(messageId) {
    if (this.socket) {
      console.log('Emitting deleteMessage:', { messageId });
      this.socket.emit('deleteMessage', { messageId });
    }
  }

  markAsRead(otherUserId) {
    if (this.socket) {
      this.socket.emit('markAsRead', { otherUserId });
    }
  }

  getUnreadCount() {
    if (this.socket) {
      this.socket.emit('getUnreadCount');
    }
  }

  // Event listeners
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.off('newMessage', callback); // Remove existing listener first
      this.socket.on('newMessage', callback);
    }
  }

  onMessageUpdated(callback) {
    if (this.socket) {
      this.socket.off('messageUpdated', callback); // Remove existing listener first
      this.socket.on('messageUpdated', callback);
    }
  }

  onMessageDeleted(callback) {
    if (this.socket) {
      this.socket.off('messageDeleted', callback); // Remove existing listener first
      this.socket.on('messageDeleted', callback);
    }
  }

  onError(callback) {
    if (this.socket) {
      this.socket.off('error', callback); // Remove existing listener first
      this.socket.on('error', callback);
    }
  }

  onUserOnline(callback) {
    if (this.socket) {
      this.socket.off('userOnline', callback); // Remove existing listener first
      this.socket.on('userOnline', callback);
    }
  }

  onUserOffline(callback) {
    if (this.socket) {
      this.socket.off('userOffline', callback); // Remove existing listener first
      this.socket.on('userOffline', callback);
    }
  }

  onMessagesRead(callback) {
    if (this.socket) {
      this.socket.off('messagesRead', callback); // Remove existing listener first
      this.socket.on('messagesRead', callback);
    }
  }

  onUnreadCount(callback) {
    if (this.socket) {
      this.socket.off('unreadCount', callback); // Remove existing listener first
      this.socket.on('unreadCount', callback);
    }
  }

  onOnlineUsers(callback) {
    if (this.socket) {
      this.socket.off('onlineUsers', callback); // Remove existing listener first
      this.socket.on('onlineUsers', callback);
    }
  }

  // Remove event listeners
  offNewMessage(callback) {
    if (this.socket) {
      this.socket.off('newMessage', callback);
    }
  }

  offMessageUpdated(callback) {
    if (this.socket) {
      this.socket.off('messageUpdated', callback);
    }
  }

  offMessageDeleted(callback) {
    if (this.socket) {
      this.socket.off('messageDeleted', callback);
    }
  }

  offError(callback) {
    if (this.socket) {
      this.socket.off('error', callback);
    }
  }

  offUserOnline(callback) {
    if (this.socket) {
      this.socket.off('userOnline', callback);
    }
  }

  offUserOffline(callback) {
    if (this.socket) {
      this.socket.off('userOffline', callback);
    }
  }

  offMessagesRead(callback) {
    if (this.socket) {
      this.socket.off('messagesRead', callback);
    }
  }

  offUnreadCount(callback) {
    if (this.socket) {
      this.socket.off('unreadCount', callback);
    }
  }

  offOnlineUsers(callback) {
    if (this.socket) {
      this.socket.off('onlineUsers', callback);
    }
  }
}

export default new SocketService();
