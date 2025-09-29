import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import CreateGroupModal from '../components/CreateGroupModal';
import socketService from '../services/socket';
import './ChatPage.css';

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  
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

    // Load conversations first, then unread counts
    loadConversations();

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
      // Update conversations list to show new last message
      loadConversations();
      loadUnreadCounts();
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

  const loadConversations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const conversationsData = await response.json();
        setConversations(conversationsData);
        
        // Join socket rooms for all conversations
        const conversationIds = conversationsData.map(conv => conv._id);
        if (conversationIds.length > 0) {
          socketService.joinRooms(conversationIds);
        }
        
        // Load unread counts after conversations are loaded
        setTimeout(() => {
          loadUnreadCounts();
        }, 100);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCounts = async () => {
    try {
      // For now, we'll calculate unread counts based on conversations
      // In a real implementation, you'd have a dedicated endpoint for conversation unread counts
      const countsMap = {};
      
      // This is a simplified approach - in production you'd want a proper API endpoint
      // that returns unread counts per conversation
      if (conversations.length > 0) {
        conversations.forEach(conv => {
          // For demonstration, we'll set some random unread counts
          // In reality, this would come from your backend
          if (Math.random() > 0.7) { // 30% chance of having unread messages
            countsMap[conv._id] = Math.floor(Math.random() * 5) + 1;
          }
        });
      }
      
      setUnreadCounts(countsMap);
    } catch (error) {
      console.error('Error loading unread counts:', error);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    // Mark messages as read when conversation is selected
    if (conversation) {
      socketService.markAsRead(conversation._id);
    }
  };

  const handleGroupCreated = (newGroup) => {
    // Add the new group to conversations list
    setConversations(prev => [newGroup, ...prev]);
    // Join the new conversation room
    socketService.joinRooms([newGroup._id]);
  };

  const handleStartDirectChat = async (user) => {
    try {
      const response = await fetch('http://localhost:5000/api/conversations/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ otherUserId: user._id })
      });

      if (response.ok) {
        const conversation = await response.json();
        
        // Check if conversation already exists in our list
        const existingConversation = conversations.find(conv => conv._id === conversation._id);
        if (!existingConversation) {
          // Add the new conversation to the list
          setConversations(prev => [conversation, ...prev]);
          // Join the conversation room
          socketService.joinRooms([conversation._id]);
        }
        
        // Select the conversation
        setSelectedConversation(conversation);
      }
    } catch (error) {
      console.error('Error starting direct chat:', error);
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
        <ConversationList 
          conversations={conversations} 
          selectedConversation={selectedConversation}
          onConversationSelect={handleConversationSelect}
          onlineUsers={onlineUsers}
          unreadCounts={unreadCounts}
          onCreateGroup={() => setShowCreateGroupModal(true)}
          onStartDirectChat={handleStartDirectChat}
        />
        <ChatWindow 
          selectedConversation={selectedConversation}
          currentUser={user}
          onlineUsers={onlineUsers}
        />
      </div>

      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onGroupCreated={handleGroupCreated}
        currentUser={user}
      />
    </div>
  );
};

export default ChatPage;
