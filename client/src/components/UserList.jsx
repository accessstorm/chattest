import React from 'react';
import './UserList.css';

const UserList = ({ users, selectedUser, onUserSelect, onlineUsers, unreadCounts }) => {
  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>Users</h3>
        <span className="user-count">{users.length}</span>
      </div>
      
      <div className="user-list-content">
        {users.length === 0 ? (
          <div className="no-users">
            <p>No other users available</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className={`user-item ${selectedUser?._id === user._id ? 'selected' : ''}`}
              onClick={() => onUserSelect(user)}
            >
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <div className="user-name">{user.username.toUpperCase()}</div>
                <div className={`user-status ${onlineUsers.has(user._id) ? 'online' : 'offline'}`}>
                  {onlineUsers.has(user._id) ? 'Online' : 'Offline'}
                </div>
              </div>
              {unreadCounts[user._id] > 0 && (
                <div className="unread-badge">
                  {unreadCounts[user._id]}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserList;
