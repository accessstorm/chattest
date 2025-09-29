import React, { useState, useEffect } from 'react';
import './CreateGroupModal.css';

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated, currentUser }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      // Reset form when modal opens
      setGroupName('');
      setSelectedUsers([]);
      setError('');
    }
  }, [isOpen]);

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
      } else {
        setError('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    }
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }

    if (selectedUsers.length === 0) {
      setError('Please select at least one member');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/conversations/group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          groupName: groupName.trim(),
          participants: selectedUsers
        })
      });

      if (response.ok) {
        const newGroup = await response.json();
        onGroupCreated(newGroup);
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Group</h2>
          <button className="close-button" onClick={handleClose} disabled={loading}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="groupName">Group Name</label>
            <input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              maxLength={50}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Select Members</label>
            <div className="users-list">
              {users.length === 0 ? (
                <div className="no-users">Loading users...</div>
              ) : (
                users.map((user) => (
                  <div key={user._id} className="user-item">
                    <label className="user-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleUserToggle(user._id)}
                        disabled={loading}
                      />
                      <span className="checkmark"></span>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="user-name">{user.username}</span>
                      </div>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="cancel-button" 
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="create-button" 
            onClick={handleCreateGroup}
            disabled={loading || !groupName.trim() || selectedUsers.length === 0}
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
