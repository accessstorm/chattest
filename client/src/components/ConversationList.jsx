import React, { useState, useEffect } from 'react';
import './UserList.css'; // Reusing the same CSS for now

const ConversationList = ({ conversations, selectedConversation, onConversationSelect, onlineUsers, unreadCounts, onCreateGroup, onStartDirectChat }) => {
  const [showUserList, setShowUserList] = useState(false);
  const [users, setUsers] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    if (showUserList) {
      loadUsers();
    }
  }, [showUserList]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

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
    }
  };

  const handleUserSelect = (user) => {
    onStartDirectChat(user);
    setShowUserList(false);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const getFilteredConversations = () => {
    switch (activeTab) {
      case 'Unread':
        return conversations.filter(conv => unreadCounts[conv._id] > 0);
      case 'Groups':
        return conversations.filter(conv => conv.isGroupChat);
      case 'One-to-One':
        return conversations.filter(conv => !conv.isGroupChat);
      default:
        return conversations;
    }
  };

  const filteredConversations = getFilteredConversations();

  const getDisplayName = (conversation) => {
    if (conversation.isGroupChat) {
      return conversation.groupName;
    } else {
      // For one-on-one chats, show the other participant's name
      return conversation.otherParticipant?.username || 'Unknown User';
    }
  };

  const getDisplayAvatar = (conversation) => {
    if (conversation.isGroupChat) {
      // For group chats, show first letter of group name
      return conversation.groupName.charAt(0).toUpperCase();
    } else {
      // For one-on-one chats, show the other participant's avatar
      return conversation.otherParticipant?.username?.charAt(0).toUpperCase() || '?';
    }
  };

  const getOnlineStatus = (conversation) => {
    if (conversation.isGroupChat) {
      // For group chats, show if any participant is online
      const hasOnlineMembers = conversation.participants.some(participant => 
        participant._id !== conversation._doc?.currentUserId && onlineUsers.has(participant._id)
      );
      return hasOnlineMembers ? 'Some members online' : 'All members offline';
    } else {
      // For one-on-one chats, show the other participant's status
      const otherParticipant = conversation.otherParticipant;
      if (!otherParticipant) return 'Offline';
      return onlineUsers.has(otherParticipant._id) ? 'Online' : 'Offline';
    }
  };

  const getOnlineStatusClass = (conversation) => {
    if (conversation.isGroupChat) {
      const hasOnlineMembers = conversation.participants.some(participant => 
        participant._id !== conversation._doc?.currentUserId && onlineUsers.has(participant._id)
      );
      return hasOnlineMembers ? 'online' : 'offline';
    } else {
      const otherParticipant = conversation.otherParticipant;
      if (!otherParticipant) return 'offline';
      return onlineUsers.has(otherParticipant._id) ? 'online' : 'offline';
    }
  };

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>ChatApp</h3>
        <div className="header-actions">
          <button 
            className="new-chat-button"
            onClick={() => setShowUserList(true)}
            title="Start New Chat"
          >
            💬
          </button>
          <button 
            className="create-group-button"
            onClick={onCreateGroup}
            title="Create New Group"
          >
            +
          </button>
          <div className="menu-container">
            <button 
              className="menu-button"
              onClick={() => setShowMenu(!showMenu)}
              title="Menu"
            >
              ⋮
            </button>
            {showMenu && (
              <div className="menu-dropdown">
                <button className="menu-item" onClick={onCreateGroup}>
                  New group
                </button>
                <button className="menu-item">
                  Starred messages
                </button>
                <button className="menu-item">
                  Select chats
                </button>
                <button className="menu-item">
                  Log out
                </button>
              </div>
            )}
          </div>
          <span className="user-count">{conversations.length}</span>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search or start a new chat"
            className="search-input"
          />
        </div>
      </div>
      
      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${activeTab === 'All' ? 'active' : ''}`}
          onClick={() => handleTabClick('All')}
        >
          All
        </button>
        <button 
          className={`filter-tab ${activeTab === 'One-to-One' ? 'active' : ''}`}
          onClick={() => handleTabClick('One-to-One')}
        >
          One-to-One
        </button>
        <button 
          className={`filter-tab ${activeTab === 'Unread' ? 'active' : ''}`}
          onClick={() => handleTabClick('Unread')}
        >
          Unread
        </button>
        <button 
          className={`filter-tab ${activeTab === 'Groups' ? 'active' : ''}`}
          onClick={() => handleTabClick('Groups')}
        >
          Groups
        </button>
      </div>
      
      <div className="user-list-content">
        {filteredConversations.length === 0 ? (
          <div className="no-users">
            <p>
              {activeTab === 'All' && 'No conversations yet'}
              {activeTab === 'One-to-One' && 'No direct chats yet'}
              {activeTab === 'Unread' && 'No unread messages'}
              {activeTab === 'Groups' && 'No groups yet'}
            </p>
            <p className="create-group-hint">
              {activeTab === 'All' && 'Create a group or start chatting with someone!'}
              {activeTab === 'One-to-One' && 'Start a new chat with someone!'}
              {activeTab === 'Unread' && 'All caught up!'}
              {activeTab === 'Groups' && 'Create your first group!'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation._id}
              className={`user-item ${selectedConversation?._id === conversation._id ? 'selected' : ''}`}
              onClick={() => onConversationSelect(conversation)}
            >
              <div className="user-avatar">
                {getDisplayAvatar(conversation)}
              </div>
              <div className="user-info">
                <div className="user-name">
                  {getDisplayName(conversation)}
                  {conversation.isGroupChat && (
                    <span className="group-indicator">👥</span>
                  )}
                </div>
                <div className={`user-status ${getOnlineStatusClass(conversation)}`}>
                  {getOnlineStatus(conversation)}
                </div>
                {conversation.lastMessage && (
                  <div className="last-message-preview">
                    {conversation.lastMessage.senderId?.username}: {conversation.lastMessage.content}
                  </div>
                )}
              </div>
              {unreadCounts[conversation._id] > 0 && (
                <div className="unread-badge">
                  {unreadCounts[conversation._id]}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* User Selection Modal for Direct Chat */}
      {showUserList && (
        <div className="user-selection-overlay" onClick={() => setShowUserList(false)}>
          <div className="user-selection-modal" onClick={(e) => e.stopPropagation()}>
            <div className="user-selection-header">
              <h3>Start New Chat</h3>
              <button className="close-button" onClick={() => setShowUserList(false)}>×</button>
            </div>
            <div className="user-selection-content">
              {users.length === 0 ? (
                <div className="loading-users">Loading users...</div>
              ) : (
                users.map((user) => (
                  <div
                    key={user._id}
                    className="user-selection-item"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="user-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.username}</div>
                      <div className={`user-status ${onlineUsers.has(user._id) ? 'online' : 'offline'}`}>
                        {onlineUsers.has(user._id) ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationList;
