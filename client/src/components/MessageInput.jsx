import React, { useState, useRef } from 'react';
import './MessageInput.css';

const MessageInput = ({ onSendMessage, replyTo, onCancelReply }) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

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

  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    const maxSize = 500 * 1024; // 500KB in bytes

    if (!allowedTypes.includes(file.type)) {
      alert('Only image (JPEG, PNG, GIF), PDF, and text files are allowed.');
      return false;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 500KB.');
      return false;
    }

    return true;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const handleSubmitWithFile = (e) => {
    e.preventDefault();
    if (message.trim() || selectedFile) {
      onSendMessage(message, replyTo, selectedFile);
      setMessage('');
      setSelectedFile(null);
      if (onCancelReply) {
        onCancelReply();
      }
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
      
      {selectedFile && (
        <div className="file-preview">
          <div className="file-info">
            <div className="file-icon">
              {selectedFile.type.startsWith('image/') ? '🖼️' : 
               selectedFile.type === 'application/pdf' ? '📄' : '📝'}
            </div>
            <div className="file-details">
              <div className="file-name">{selectedFile.name}</div>
              <div className="file-size">{(selectedFile.size / 1024).toFixed(1)} KB</div>
            </div>
            <button 
              type="button" 
              onClick={removeSelectedFile} 
              className="file-remove"
              title="Remove file"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmitWithFile} className="message-input-form">
        <div className="input-wrapper">
          <button
            type="button"
            onClick={handleFileUpload}
            className="attach-button"
            title="Attach file (Images, PDF, TXT - Max 500KB)"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
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
            disabled={!message.trim() && !selectedFile}
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
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,.pdf,.txt"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default MessageInput;
