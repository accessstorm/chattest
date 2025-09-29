import React, { useState, useEffect, useRef, useCallback } from 'react';
import Message from './Message';
import MessageInput from './MessageInput';
import ForwardModal from './ForwardModal';
import { messagesAPI } from '../services/api';
import socketService from '../services/socket';
import './ChatWindow.css';

const ChatWindow = ({ selectedConversation, currentUser, onlineUsers }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [messageToForward, setMessageToForward] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Wrap event handlers in useCallback to give them a stable identity.
  //    This prevents them from being recreated on every render.
  const handleNewMessage = useCallback((message) => {
    if (!selectedConversation) return;
    if (message.conversationId === selectedConversation._id) {
      setMessages(prev => [...prev, message]);
    }
  }, [selectedConversation]); // Dependencies for this handler

  const handleMessageUpdated = useCallback((updatedMessage) => {
    console.log('Message updated received:', updatedMessage);
    setMessages(prev =>
      prev.map(msg =>
        msg._id === updatedMessage._id ? updatedMessage : msg
      )
    );
  }, []); // No dependencies needed here

  const handleMessageDeleted = useCallback((deletedMessage) => {
    console.log('Message deleted received:', deletedMessage);
    setMessages(prev =>
      prev.map(msg =>
        msg._id === deletedMessage._id ? deletedMessage : msg
      )
    );
  }, []); // No dependencies needed here

  const handleError = useCallback((error) => {
    console.error('Socket error:', error);
  }, []);

  const handleMessagesRead = useCallback((data) => {
    console.log('Messages read event received:', data);
    const { readerId, conversationId } = data;
    
    // Only update if this is for the current conversation
    if (selectedConversation && conversationId === selectedConversation._id) {
      setMessages(prev => 
        prev.map(msg => {
          // For messages sent by the current user, add the reader to readBy array
          if (msg.senderId._id.toString() === currentUser.id.toString()) {
            // Check if reader is not already in readBy array
            const isAlreadyRead = msg.readBy && msg.readBy.some(
              reader => reader._id.toString() === readerId.toString()
            );
            
            if (!isAlreadyRead) {
              console.log('Adding reader to message readBy:', readerId);
              return {
                ...msg,
                readBy: [...(msg.readBy || []), { _id: readerId }]
              };
            }
          }
          return msg;
        })
      );
    }
  }, [selectedConversation, currentUser.id]);

  // Set up socket event listeners once when component mounts
  useEffect(() => {
    socketService.onNewMessage(handleNewMessage);
    socketService.onMessageUpdated(handleMessageUpdated);
    socketService.onMessageDeleted(handleMessageDeleted);
    socketService.onError(handleError);
    socketService.onMessagesRead(handleMessagesRead);

    return () => {
      socketService.offNewMessage(handleNewMessage);
      socketService.offMessageUpdated(handleMessageUpdated);
      socketService.offMessageDeleted(handleMessageDeleted);
      socketService.offError(handleError);
      socketService.offMessagesRead(handleMessagesRead);
    };
  }, [handleNewMessage, handleMessageUpdated, handleMessageDeleted, handleError, handleMessagesRead]);

  // Load messages when selectedConversation changes
  useEffect(() => {
    if (selectedConversation) {
      const loadMessages = async () => {
        setLoading(true);
        try {
          const response = await fetch(`http://localhost:5000/api/conversations/${selectedConversation._id}/messages`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const messagesData = await response.json();
            setMessages(messagesData);
          }
        } catch (error) {
          console.error('Error loading messages:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadMessages();
      socketService.markAsRead(selectedConversation._id);
      // Emit markMessagesAsRead to track read status with readBy field
      socketService.markMessagesAsRead(selectedConversation._id);
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);


  const handleSendMessage = async (content, replyToMessage, file) => {
    if (selectedConversation && (content.trim() || file)) {
      let messageContent = content.trim();
      
      // If there's a file, convert it to base64 and include it in the message
      if (file) {
        try {
          const base64 = await convertFileToBase64(file);
          const fileInfo = {
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64
          };
          
          if (messageContent) {
            messageContent += `\n[FILE:${JSON.stringify(fileInfo)}]`;
          } else {
            messageContent = `[FILE:${JSON.stringify(fileInfo)}]`;
          }
        } catch (error) {
          console.error('Error converting file to base64:', error);
          alert('Error processing file. Please try again.');
          return;
        }
      }
      
      socketService.sendMessage(selectedConversation._id, messageContent);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleReply = (message) => {
    setReplyTo(message);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleForward = (message) => {
    setMessageToForward(message);
    setShowForwardModal(true);
  };

  const handleForwardToUsers = (message, userIds) => {
    // For now, we'll create direct conversations with each user and send the message
    // In a full implementation, you'd handle this differently
    userIds.forEach(async (userId) => {
      try {
        const response = await fetch('http://localhost:5000/api/conversations/direct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ otherUserId: userId })
        });
        
        if (response.ok) {
          const conversation = await response.json();
          socketService.sendMessage(conversation._id, message.content);
        }
      } catch (error) {
        console.error('Error forwarding message:', error);
      }
    });
    setShowForwardModal(false);
    setMessageToForward(null);
  };

  const handleCloseForwardModal = () => {
    setShowForwardModal(false);
    setMessageToForward(null);
  };

  const handleCopy = (message) => {
    navigator.clipboard.writeText(message.content).then(() => {
      alert('Message copied to clipboard');
    }).catch(() => {
      alert('Failed to copy message');
    });
  };

  if (!selectedConversation) {
    return (
      <div className="chat-window">
        <div className="no-conversation">
          <div className="no-conversation-content">
            <h3>Select a conversation to start chatting</h3>
            <p>Choose a conversation from the list or create a new group to begin</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="chat-user-avatar">
            {selectedConversation.isGroupChat 
              ? selectedConversation.groupName.charAt(0).toUpperCase()
              : selectedConversation.otherParticipant?.username?.charAt(0).toUpperCase() || '?'
            }
          </div>
          <div>
            <h3>
              {selectedConversation.isGroupChat 
                ? selectedConversation.groupName.toUpperCase()
                : selectedConversation.otherParticipant?.username?.toUpperCase() || 'Unknown User'
              }
              {selectedConversation.isGroupChat && <span className="group-indicator">👥</span>}
            </h3>
            <span className={`chat-status ${
              selectedConversation.isGroupChat 
                ? (selectedConversation.participants.some(p => onlineUsers.has(p._id)) ? 'online' : 'offline')
                : (onlineUsers.has(selectedConversation.otherParticipant?._id) ? 'online' : 'offline')
            }`}>
              {selectedConversation.isGroupChat 
                ? (selectedConversation.participants.some(p => onlineUsers.has(p._id)) ? 'Some members online' : 'All members offline')
                : (onlineUsers.has(selectedConversation.otherParticipant?._id) ? 'Online' : 'Offline')
              }
            </span>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading-messages">Loading messages...</div>
        ) : (
          <>
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <Message
                  key={message._id}
                  message={message}
                  currentUser={currentUser}
                  conversation={selectedConversation}
                  onReply={handleReply}
                  onForward={handleForward}
                  onCopy={handleCopy}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <MessageInput 
        onSendMessage={handleSendMessage} 
        replyTo={replyTo}
        onCancelReply={handleCancelReply}
      />

      <ForwardModal
        isOpen={showForwardModal}
        onClose={handleCloseForwardModal}
        message={messageToForward}
        users={[]} // We'll need to load users separately for forwarding
        onForward={handleForwardToUsers}
        currentUser={currentUser}
      />
    </div>
  );
};

export default ChatWindow;