import React, { useState, useEffect } from 'react';
import './ForwardModal.css';

const ForwardModal = ({ isOpen, onClose, message, users, onForward, currentUser }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedUsers([]);
      setSearchTerm('');
    }
  }, [isOpen]);

  const filteredUsers = users.filter(user => 
    user._id !== currentUser.id && 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleForward = () => {
    if (selectedUsers.length > 0) {
      onForward(message, selectedUsers);
      onClose();
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user._id));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="forward-modal-overlay">
      <div className="forward-modal">
        <div className="forward-modal-header">
          <button onClick={onClose} className="close-btn">
            ×
          </button>
          <h3>Forward message to</h3>
        </div>

        <div className="forward-modal-content">
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search name or number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="chats-section">
            <div className="section-header">
              <h4>Recent chats</h4>
              {filteredUsers.length > 0 && (
                <button onClick={handleSelectAll} className="select-all-btn">
                  {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            <div className="chats-list">
              {filteredUsers.map(user => (
                <div 
                  key={user._id} 
                  className={`chat-item ${selectedUsers.includes(user._id) ? 'selected' : ''}`}
                  onClick={() => handleUserToggle(user._id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => handleUserToggle(user._id)}
                    className="chat-checkbox"
                  />
                  <div className="chat-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="chat-info">
                    <div className="chat-name">{user.username}</div>
                    <div className="chat-description">Message yourself</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="forward-modal-footer">
          <div className="selection-info">
            {selectedUsers.length > 0 && (
              <span>{selectedUsers.length} selected</span>
            )}
          </div>
          <div className="footer-actions">
            <button onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button 
              onClick={handleForward} 
              className="forward-btn"
              disabled={selectedUsers.length === 0}
            >
              Forward
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;
