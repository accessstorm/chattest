import React, { useState } from 'react';
import './MessageInput.css';

const MessageInput = ({ onSendMessage, replyTo, onCancelReply }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message, replyTo);
      setMessage('');
      if (onCancelReply) {
        onCancelReply();
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="message-input-container">
      {replyTo && (
        <div className="reply-preview">
          <div className="reply-content">
            <div className="reply-line"></div>
            <div className="reply-text">
              <span className="reply-sender">{replyTo.senderId.username}</span>
              <span className="reply-message">{replyTo.content}</span>
            </div>
            <button 
              type="button" 
              onClick={onCancelReply} 
              className="reply-cancel"
              title="Cancel reply"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="input-wrapper">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={replyTo ? "Type a reply..." : "Type your message..."}
            className="message-input"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="send-button"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
