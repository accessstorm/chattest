import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserList from '../components/UserList';
import ChatWindow from '../components/ChatWindow';
import socketService from '../services/socket';
import './ChatPage.css';

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Connect to socket
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
    }

    // Load users and unread counts
    loadUsers();
    loadUnreadCounts();

    // Set up socket event listeners
    const handleUserOnline = (userId) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    };

    const handleUserOffline = (userId) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    const handleNewMessage = (message) => {
      // If the message is for the current user, update unread count
      if (message.receiverId._id === user.id) {
        loadUnreadCounts();
      }
    };

    const handleMessagesRead = (data) => {
      // Update unread counts when messages are read
      loadUnreadCounts();
    };

    const handleOnlineUsers = (onlineUserIds) => {
      // Set initial online users when connecting
      setOnlineUsers(new Set(onlineUserIds));
    };

    socketService.onUserOnline(handleUserOnline);
    socketService.onUserOffline(handleUserOffline);
    socketService.onNewMessage(handleNewMessage);
    socketService.onMessagesRead(handleMessagesRead);
    socketService.onOnlineUsers(handleOnlineUsers);

    return () => {
      socketService.offUserOnline(handleUserOnline);
      socketService.offUserOffline(handleUserOffline);
      socketService.offNewMessage(handleNewMessage);
      socketService.offMessagesRead(handleMessagesRead);
      socketService.offOnlineUsers(handleOnlineUsers);
      socketService.disconnect();
    };
  }, [user, navigate]);

  const loadUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCounts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/messages/unread/counts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const unreadData = await response.json();
        const countsMap = {};
        unreadData.forEach(item => {
          countsMap[item.senderId] = item.unreadCount;
        });
        setUnreadCounts(countsMap);
      }
    } catch (error) {
      console.error('Error loading unread counts:', error);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    // Mark messages as read when user is selected
    if (user) {
      socketService.markAsRead(user._id);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="chat-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="user-info">
          <h2>Welcome, {user.username.toUpperCase()}</h2>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      
      <div className="chat-main">
        <UserList 
          users={users} 
          selectedUser={selectedUser}
          onUserSelect={handleUserSelect}
          onlineUsers={onlineUsers}
          unreadCounts={unreadCounts}
        />
        <ChatWindow 
          selectedUser={selectedUser}
          currentUser={user}
          onlineUsers={onlineUsers}
          users={users}
        />
      </div>
    </div>
  );
};

export default ChatPage;
