import React, { useState, useEffect } from 'react';
import socketService from '../services/socket';
import './Message.css';

const Message = ({ message, currentUser, conversation, onReply, onForward, onCopy }) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showBreadcrumbMenu, setShowBreadcrumbMenu] = useState(false);

  const isOwnMessage = message.senderId._id === currentUser.id;
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

  // Determine read status for tick icon
  const getReadStatus = () => {
    if (!isOwnMessage || !conversation) return null;
    
    // For one-on-one chats, find the other participant
    if (!conversation.isGroupChat) {
      const otherParticipant = conversation.participants.find(
        participant => participant._id.toString() !== currentUser.id.toString()
      );
      
      if (otherParticipant) {
        const isRead = message.readBy && message.readBy.some(
          reader => reader._id.toString() === otherParticipant._id.toString()
        );
        
        return isRead ? 'read' : 'sent';
      }
    }
    
    // For group chats, we could implement more complex logic later
    // For now, just show as sent
    return 'sent';
  };

  const renderTickIcon = () => {
    const readStatus = getReadStatus();
    
    if (!readStatus) return null;
    
    if (readStatus === 'read') {
      return (
        <span className="tick-icon read" title="Read">
          ✓✓
        </span>
      );
    } else {
      return (
        <span className="tick-icon sent" title="Sent">
          ✓
        </span>
      );
    }
  };

  const parseMessageContent = (content) => {
    const fileRegex = /\[FILE:(.*?)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = fileRegex.exec(content)) !== null) {
      // Add text before the file
      if (match.index > lastIndex) {
        const textContent = content.slice(lastIndex, match.index).trim();
        if (textContent) {
          parts.push({ type: 'text', content: textContent });
        }
      }

      // Parse and add the file
      try {
        const fileInfo = JSON.parse(match[1]);
        parts.push({ type: 'file', content: fileInfo });
      } catch (error) {
        console.error('Error parsing file info:', error);
        parts.push({ type: 'text', content: match[0] });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      const textContent = content.slice(lastIndex).trim();
      if (textContent) {
        parts.push({ type: 'text', content: textContent });
      }
    }

    return parts.length > 0 ? parts : [{ type: 'text', content }];
  };

  const renderFile = (fileInfo) => {
    const { name, type, size, data } = fileInfo;
    
    if (type.startsWith('image/')) {
      return (
        <div className="file-attachment image-attachment">
          <img 
            src={data} 
            alt={name}
            className="attachment-image"
            onClick={() => window.open(data, '_blank')}
          />
          <div className="file-info">
            <div className="file-name">{name}</div>
            <div className="file-size">{(size / 1024).toFixed(1)} KB</div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="file-attachment document-attachment">
          <div className="file-icon">
            {type === 'application/pdf' ? '📄' : '📝'}
          </div>
          <div className="file-info">
            <div className="file-name">{name}</div>
            <div className="file-size">{(size / 1024).toFixed(1)} KB</div>
          </div>
          <button 
            className="download-btn"
            onClick={() => {
              const link = document.createElement('a');
              link.href = data;
              link.download = name;
              link.click();
            }}
            title="Download file"
          >
            ⬇️
          </button>
        </div>
      );
    }
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
              <div className="message-content-parts">
                {parseMessageContent(message.content).map((part, index) => (
                  <div key={index}>
                    {part.type === 'text' ? (
                      <div className="message-text">{part.content}</div>
                    ) : (
                      renderFile(part.content)
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="message-meta">
              <span className="message-time">
                {formatTime(messageTime)}
                {message.isEdited && <span className="edited-indicator"> (edited)</span>}
              </span>
              {renderTickIcon()}
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
