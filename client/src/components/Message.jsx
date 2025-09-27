import React, { useState, useEffect } from 'react';
import socketService from '../services/socket';
import './Message.css';

const Message = ({ message, currentUserId, onReply, onForward, onCopy }) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showBreadcrumbMenu, setShowBreadcrumbMenu] = useState(false);

  const isOwnMessage = message.senderId._id === currentUserId;
  const messageTime = new Date(message.timestamp);

  // Update local state when message prop changes
  useEffect(() => {
    setEditContent(message.content);
  }, [message.content]);

  useEffect(() => {
    // Calculate time left for edit/delete (30 seconds from message creation)
    const timeDiff = Date.now() - messageTime.getTime();
    const remainingTime = Math.max(0, 30000 - timeDiff);
    
    if (remainingTime > 0) {
      setTimeLeft(Math.ceil(remainingTime / 1000));
      setShowActions(true);
      
      const timer = setTimeout(() => {
        setShowActions(false);
        setTimeLeft(0);
      }, remainingTime);
      
      return () => clearTimeout(timer);
    } else {
      setShowActions(false);
      setTimeLeft(0);
    }
  }, [message.timestamp]);

  // Close breadcrumb menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showBreadcrumbMenu && !event.target.closest('.breadcrumb-container')) {
        setShowBreadcrumbMenu(false);
      }
    };

    if (showBreadcrumbMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showBreadcrumbMenu]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent.trim() !== message.content) {
      socketService.editMessage(message._id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      socketService.deleteMessage(message._id);
    }
  };

  const handleReply = () => {
    if (onReply) {
      onReply(message);
    }
  };

  const handleForward = () => {
    if (onForward) {
      onForward(message);
    }
  };

  const handleCopy = () => {
    if (onCopy) {
      onCopy(message);
    }
    setShowBreadcrumbMenu(false);
  };

  const handleBreadcrumbClick = (e) => {
    e.stopPropagation();
    setShowBreadcrumbMenu(!showBreadcrumbMenu);
  };

  const handleMenuAction = (action) => {
    switch (action) {
      case 'reply':
        handleReply();
        break;
      case 'forward':
        handleForward();
        break;
      case 'copy':
        handleCopy();
        break;
    }
    setShowBreadcrumbMenu(false);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message ${isOwnMessage ? 'own' : 'other'}`}>
      <div className="message-content">
        {isEditing ? (
          <div className="edit-form">
            <input
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="edit-input"
              autoFocus
            />
            <div className="edit-actions">
              <button onClick={handleSaveEdit} className="save-btn">
                Save
              </button>
              <button onClick={handleCancelEdit} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {message.isDeleted ? (
              <div className="message-text deleted-message">
                <em>This message was deleted by the user</em>
              </div>
            ) : (
              <div className="message-text">{message.content}</div>
            )}
            <div className="message-meta">
              <span className="message-time">
                {formatTime(messageTime)}
                {message.isEdited && <span className="edited-indicator"> (edited)</span>}
              </span>
              <div className="message-actions">
                {!message.isDeleted && (
                  <div className="breadcrumb-container">
                    <button 
                      onClick={handleBreadcrumbClick} 
                      className="breadcrumb-btn"
                      title="More actions"
                    >
                      ⋯
                    </button>
                    {showBreadcrumbMenu && (
                      <div className="breadcrumb-popup">
                        <button 
                          onClick={() => handleMenuAction('reply')} 
                          className="popup-btn reply-btn"
                        >
                          Reply
                        </button>
                        <button 
                          onClick={() => handleMenuAction('forward')} 
                          className="popup-btn forward-btn"
                        >
                          Forward
                        </button>
                        <button 
                          onClick={() => handleMenuAction('copy')} 
                          className="popup-btn copy-btn"
                        >
                          Copy
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {showActions && isOwnMessage && !message.isDeleted && (
                  <>
                    <button onClick={handleEdit} className="action-btn edit-btn">
                      Edit
                    </button>
                    <button onClick={handleDelete} className="action-btn delete-btn">
                      Delete
                    </button>
                    <span className="time-left">({timeLeft}s)</span>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Message;
