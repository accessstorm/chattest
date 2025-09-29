# Real-time Chat Application

A comprehensive full-stack real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO for real-time communication. This application features advanced messaging capabilities including reply functionality, message forwarding, breadcrumb menus, and a modern WhatsApp-inspired UI.

## 🚀 Features Overview

### Core Messaging Features
- **Real-time messaging** with Socket.IO for instant communication
- **Message editing and deletion** within 30 seconds of sending
- **Reply functionality** with quoted message display
- **Message forwarding** to multiple conversations simultaneously
- **Copy message** to clipboard functionality
- **File sharing** with support for images, PDFs, and text files (up to 500KB)
- **Persistent chat history** stored in MongoDB
- **Message read status indicators** with visual tick icons (grey/blue)

### User Interface Features
- **Modern WhatsApp-inspired design** with yellow accent colors (#ffda03)
- **Breadcrumb menu system** for message actions (Reply, Forward, Copy)
- **Forward message popup** with conversation selection and search
- **Reply preview** in message input with quoted content
- **File attachment interface** with + icon and file preview
- **Responsive design** optimized for mobile and desktop
- **User avatars** with first letter display
- **Online/offline status** indicators

### Authentication & Security
- **JWT-based authentication** with secure token management
- **User registration and login** system
- **Protected routes** and API endpoints
- **Automatic token refresh** and logout on expiration
- **Password hashing** with bcrypt

### Advanced Functionality
- **Unread message counts** per conversation
- **Message read status** tracking with real-time tick icon updates
- **User presence** (online/offline) detection
- **Conversation management** with user selection
- **Search functionality** in forward modal
- **Bulk conversation selection** for forwarding
- **File validation** with type and size restrictions
- **Image preview** with click-to-expand functionality
- **Document download** for PDF and text files

## 🛠 Technology Stack

### Backend Technologies
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend Technologies
- **React 18** - UI library with hooks
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **CSS3** - Styling with modern features
- **Context API** - State management
- **Socket.IO Client** - Real-time communication

### Development Tools
- **Nodemon** - Backend auto-restart
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd chat-app
```

### 2. Backend Setup

Navigate to the server directory:
```bash
cd server
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the server directory with the following content:
```env
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
MONGODB_URI=mongodb://localhost:27017/chat-app
PORT=5000
```

**Important:** Replace `your_jwt_secret_key_here_change_this_in_production` with a strong, random secret key.

### 3. Frontend Setup

Navigate to the client directory:
```bash
cd ../client
```

Install dependencies:
```bash
npm install
```

### 4. Database Setup

Make sure MongoDB is running on your system:
- **Local MongoDB:** Start MongoDB service
- **MongoDB Atlas:** Use your connection string in the `.env` file

## Running the Application

### 1. Start the Backend Server

From the server directory:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### 2. Start the Frontend

From the client directory:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Creating Dummy Users

After starting the server, you need to create two users for testing. Use one of the following methods:

### Method 1: Using curl

```bash
# Create user1
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "user1", "password": "password123"}'

# Create user2
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "user2", "password": "password123"}'
```

### Method 2: Using Postman

1. Open Postman
2. Create a new POST request to `http://localhost:5000/api/auth/register`
3. Set Content-Type to `application/json`
4. Create user1:
   ```json
   {
     "username": "user1",
     "password": "password123"
   }
   ```
5. Create user2:
   ```json
   {
     "username": "user2",
     "password": "password123"
   }
   ```

## 🧪 Comprehensive Testing Guide

### Basic Chat Testing
1. Open two browser windows/tabs
2. Navigate to `http://localhost:5173` in both
3. Login with different users:
   - Window 1: `alice` / `password123`
   - Window 2: `bob` / `password123`
4. Start a conversation between the users

### Advanced Feature Testing

#### Reply Functionality Testing
1. **Send Initial Message:** Send "Hello, how are you?" from Alice
2. **Trigger Reply:** Click the "⋯" button on Bob's message
3. **Select Reply:** Click "Reply" from the popup menu
4. **Verify Preview:** Check that reply preview shows above input with green line
5. **Send Reply:** Type "I'm doing great, thanks!" and send
6. **Verify Display:** Confirm reply shows with quoted original message

#### Forward Functionality Testing
1. **Select Message:** Click "⋯" on any message
2. **Open Forward Modal:** Click "Forward" from popup
3. **Search Users:** Type in search box to filter users
4. **Select Multiple Users:** Check boxes next to multiple users
5. **Verify Counter:** Check that selection counter shows correct number
6. **Forward Message:** Click "Forward" button
7. **Verify Delivery:** Check that message appears in all selected users' chats

#### Breadcrumb Menu Testing
1. **Click Menu Button:** Click "⋯" on any message
2. **Verify Popup:** Check that popup appears with Reply, Forward, Copy options
3. **Test Positioning:** Verify popup positions correctly (right for own messages, left for others)
4. **Test Click Outside:** Click outside popup to verify it closes
5. **Test Actions:** Click each action to verify functionality

#### Message Actions Testing (Edit/Delete)
1. **Send Message:** Send a message from your account
2. **Verify Buttons:** Check that Edit and Delete buttons appear
3. **Test Timer:** Wait and verify buttons disappear after 30 seconds
4. **Test Edit:** Click Edit, modify text, and save
5. **Test Delete:** Click Delete and confirm deletion
6. **Verify Indicators:** Check that edited messages show "(edited)" label

#### Copy Functionality Testing
1. **Click Copy:** Click "⋯" → "Copy" on any message
2. **Verify Notification:** Check that "Message copied to clipboard" appears
3. **Test Paste:** Paste in another application to verify content

#### Responsive Design Testing
1. **Desktop Testing:** Test all features on desktop browser
2. **Mobile Testing:** Resize browser or use mobile device
3. **Touch Testing:** Verify touch interactions work on mobile
4. **Layout Testing:** Check that layouts adapt properly to screen size

### Performance Testing
1. **Load Testing:** Send multiple messages rapidly
2. **Connection Testing:** Test with poor network conditions
3. **Memory Testing:** Monitor browser memory usage during extended use
4. **Real-time Testing:** Verify messages appear instantly across multiple tabs

## 🎯 Key Features Deep Dive

### Reply System
The reply system allows users to respond to specific messages with context:

1. **Reply Trigger:** Click "⋯" → "Reply" on any message
2. **Reply Preview:** Shows quoted message above input field with green vertical line
3. **Reply Format:** Messages display with quoted content at the top
4. **Visual Design:** Green vertical line (#4CAF50) and sender name in quoted section

**Technical Implementation:**
- Reply data is stored in message object
- Frontend parses reply information for display
- Socket events handle reply message transmission
- Quoted messages show original sender and content

### Forward System
The forward system enables sending messages to multiple conversations:

1. **Forward Trigger:** Click "⋯" → "Forward" on any message
2. **Conversation Selection:** Modal opens with all available conversations and checkboxes
3. **Multi-Selection:** Select multiple conversations with search functionality
4. **Bulk Send:** Message is sent to all selected conversations simultaneously

**Technical Implementation:**
- ForwardModal component handles conversation selection
- Socket service sends message to multiple conversation rooms
- Search functionality filters conversations in real-time
- Selection counter shows number of selected conversations
- Current conversation is filtered out to prevent self-forwarding

### Breadcrumb Menu System
The breadcrumb menu provides a clean interface for message actions:

1. **Single Button:** "⋯" button replaces multiple action buttons
2. **Popup Menu:** Dropdown appears with Reply, Forward, Copy options
3. **Smart Positioning:** Menu positions based on message alignment (left/right)
4. **Click Outside:** Menu closes when clicking elsewhere

**Technical Implementation:**
- State management for menu visibility
- Event listeners for click outside detection
- CSS positioning for proper menu placement
- Hover effects with color-coded actions

### Message Actions (Edit/Delete)
Time-limited message editing and deletion:

1. **30-Second Window:** Actions available only for 30 seconds after sending
2. **Visual Countdown:** Timer shows remaining time in seconds
3. **Auto-Hide:** Buttons disappear after time limit expires
4. **Edit Indicators:** Edited messages show "(edited)" label

**Technical Implementation:**
- useEffect hooks manage timer state
- Socket events handle edit/delete operations
- Database updates reflect changes in real-time
- Visual feedback for user actions

### File Sharing System
The file sharing system allows users to attach and share files with restrictions:

1. **File Selection:** Click "+" icon to open file picker
2. **File Validation:** Only images (JPEG, PNG, GIF), PDFs, and text files up to 500KB
3. **File Preview:** Selected files show with name, size, and remove option
4. **File Display:** Images show as thumbnails, documents show with download button

**Technical Implementation:**
- File validation with MIME type and size checking
- Base64 encoding for file transmission
- File metadata preservation (name, type, size)
- Image preview with click-to-expand functionality
- Document download with one-click functionality
- Mixed content support (text + files in same message)

### Message Read Status System
The read status system provides visual indicators for message delivery:

1. **Visual Indicators:** Grey tick (✓) for sent, blue tick (✓✓) for read
2. **Real-time Updates:** Tick icons change color instantly when messages are read
3. **Read Tracking:** Backend tracks which users have read each message
4. **One-on-One Support:** Works perfectly for direct conversations

**Technical Implementation:**
- `readBy` array in Message model stores user IDs who have read the message
- `markMessagesAsRead` socket event updates read status
- `messagesRead` event notifies all participants of read status changes
- Real-time UI updates when other users read messages
- Efficient database queries with `$addToSet` for read tracking

### Real-time Messaging
- Messages are sent instantly using Socket.IO
- No page refresh needed
- Messages are stored in MongoDB for persistence
- Online/offline status tracking
- Unread message counts per conversation

### Authentication & Security
- JWT-based authentication with secure token management
- Tokens stored in localStorage with automatic refresh
- Protected routes and API endpoints
- Password hashing with bcrypt
- CORS configuration for secure cross-origin requests

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users (except current user)

### Messages
- `GET /api/messages/:otherUserId` - Get conversation history

## Socket.IO Events

### Client to Server
- `sendMessage` - Send a new message (supports text and file attachments)
- `editMessage` - Edit an existing message
- `deleteMessage` - Delete a message
- `markMessagesAsRead` - Mark messages as read in a conversation
- `joinRooms` - Join conversation rooms for real-time updates

### Server to Client
- `newMessage` - Receive a new message
- `messageUpdated` - Receive message update
- `messageDeleted` - Receive message deletion notification
- `messagesRead` - Receive notification when messages are read by other users
- `userOnline` - User comes online
- `userOffline` - User goes offline
- `onlineUsers` - List of currently online users
- `error` - Receive error messages

## 📁 Detailed Project Structure

```
chattest-master/
├── server/                          # Backend Application
│   ├── models/                      # Database Models
│   │   ├── User.js                  # User schema with authentication
│   │   ├── Message.js               # Message schema with read tracking
│   │   └── Conversation.js          # Conversation schema for groups and direct chats
│   ├── routes/                      # API Routes
│   │   ├── auth.js                  # Authentication endpoints
│   │   ├── users.js                 # User management endpoints
│   │   ├── messages.js              # Message CRUD endpoints
│   │   └── conversations.js         # Conversation management endpoints
│   ├── socket/                      # Socket.IO Handlers
│   │   └── socketHandler.js         # Real-time event handling
│   ├── middleware/                  # Custom Middleware
│   │   └── auth.js                  # JWT authentication middleware
│   ├── package.json                 # Backend dependencies
│   └── index.js                     # Server entry point
├── client/                          # Frontend Application
│   ├── src/
│   │   ├── components/              # Reusable UI Components
│   │   │   ├── Message.jsx          # Individual message component with file support
│   │   │   ├── Message.css          # Message styling with file attachment styles
│   │   │   ├── MessageInput.jsx     # Message input with file upload and reply preview
│   │   │   ├── MessageInput.css     # Input styling with attach button
│   │   │   ├── ChatWindow.jsx       # Main chat interface with file handling
│   │   │   ├── ChatWindow.css       # Chat window styling
│   │   │   ├── ConversationList.jsx # Conversation selection sidebar
│   │   │   ├── ForwardModal.jsx     # Forward message modal with conversation selection
│   │   │   ├── ForwardModal.css     # Modal styling
│   │   │   ├── CreateGroupModal.jsx # Group creation modal
│   │   │   └── CreateGroupModal.css # Group modal styling
│   │   ├── pages/                   # Page Components
│   │   │   ├── LoginPage.jsx        # User authentication page
│   │   │   ├── LoginPage.css        # Login page styling
│   │   │   ├── ChatPage.jsx         # Main chat application page
│   │   │   └── ChatPage.css         # Chat page styling
│   │   ├── services/                # External Services
│   │   │   ├── api.js               # REST API service
│   │   │   └── socket.js            # Socket.IO service
│   │   ├── utils/                   # Utilities and Contexts
│   │   │   └── AuthContext.jsx      # Authentication context
│   │   ├── App.jsx                  # Main application component
│   │   ├── App.css                  # Global application styles
│   │   ├── main.jsx                 # Application entry point
│   │   └── style.css                # Global styles
│   ├── public/                      # Static Assets
│   │   └── vite.svg                 # Vite logo
│   ├── package.json                 # Frontend dependencies
│   └── index.html                   # HTML template
└── README.md                        # This documentation
```

## 🎨 UI Components Documentation

### Message Component (`Message.jsx`)
**Purpose:** Displays individual messages with all interactive features

**Features:**
- Message content display with proper formatting
- Breadcrumb menu with Reply, Forward, Copy buttons
- Edit/Delete buttons (30-second window for own messages)
- Quoted message display for replies with green styling
- Time display and edit indicators
- Responsive design for mobile and desktop

**Props:**
- `message`: Message object with content, sender, timestamp, replyTo
- `currentUserId`: ID of current user for ownership checks
- `onReply`: Callback function for reply action
- `onForward`: Callback function for forward action
- `onCopy`: Callback function for copy action

**State Management:**
- `showActions`: Controls edit/delete button visibility
- `isEditing`: Tracks edit mode state
- `editContent`: Stores edited message content
- `timeLeft`: Countdown timer for action availability
- `showBreadcrumbMenu`: Controls popup menu visibility

### MessageInput Component (`MessageInput.jsx`)
**Purpose:** Handles message input with reply preview functionality

**Features:**
- Text input with character limit (1000 characters)
- Reply preview with quoted message and green vertical line
- Send button with icon and hover effects
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Dynamic placeholder text based on context
- Cancel reply functionality

**Props:**
- `onSendMessage`: Callback when message is sent
- `replyTo`: Message being replied to (optional)
- `onCancelReply`: Callback to cancel reply mode

**Visual Elements:**
- Reply preview with green line (#4CAF50)
- Sender name in green text
- Original message content in gray
- Cancel button (×) to dismiss reply

### ChatWindow Component (`ChatWindow.jsx`)
**Purpose:** Main chat interface container and coordinator

**Features:**
- Message list display with auto-scroll
- User selection and conversation management
- Socket event handling for real-time updates
- Message loading and error states
- Forward modal integration
- Reply state management

**Props:**
- `selectedUser`: Currently selected user for chat
- `currentUser`: Current logged-in user object
- `onlineUsers`: Set of online user IDs
- `users`: Array of all available users

**State Management:**
- `messages`: Array of conversation messages
- `loading`: Loading state for message fetching
- `replyTo`: Message being replied to
- `showForwardModal`: Forward modal visibility
- `messageToForward`: Message selected for forwarding

### ForwardModal Component (`ForwardModal.jsx`)
**Purpose:** Modal for forwarding messages to multiple users

**Features:**
- User list with checkboxes for multi-selection
- Real-time search functionality
- Select all/deselect all functionality
- Selection counter display
- Responsive design for mobile devices
- Keyboard navigation support

**Props:**
- `isOpen`: Modal visibility state
- `onClose`: Callback to close modal
- `message`: Message object to forward
- `users`: Array of available users
- `onForward`: Callback when forwarding to selected users
- `currentUser`: Current user object

**UI Elements:**
- Header with close button (×)
- Search input with magnifying glass icon
- User list with avatars and checkboxes
- Footer with selection count and action buttons
- Green accent colors for consistency

### UserList Component (`UserList.jsx`)
**Purpose:** Sidebar showing all users and conversation management

**Features:**
- User list with avatars (first letter of username)
- Online/offline status indicators with colored dots
- Unread message counts with badges
- User selection for starting conversations
- Responsive design with mobile optimization

**Props:**
- `users`: Array of all users
- `selectedUser`: Currently selected user
- `onUserSelect`: Callback for user selection
- `onlineUsers`: Set of online user IDs
- `unreadCounts`: Object with unread counts per user

## 🐛 Troubleshooting Guide

### Common Issues and Solutions

#### 1. MongoDB Connection Issues
**Problem:** "MongoDB connection failed" or database errors
**Solutions:**
- Ensure MongoDB is running: `mongod --version`
- Check connection string in `.env` file
- Verify MongoDB port (default: 27017)
- Check firewall settings
- For MongoDB Atlas, verify network access settings

#### 2. Socket.IO Connection Problems
**Problem:** "Socket connection failed" or real-time features not working
**Solutions:**
- Verify server is running on port 5000
- Check CORS configuration in server
- Clear browser cache and localStorage
- Check network connectivity
- Verify Socket.IO client version compatibility

#### 3. Authentication Issues
**Problem:** "Token invalid" or login failures
**Solutions:**
- Clear localStorage: `localStorage.clear()`
- Verify JWT_SECRET in `.env` file
- Check token expiration settings
- Ensure proper API endpoint URLs
- Verify password hashing is working

#### 4. Frontend Build Issues
**Problem:** "Module not found" or build errors
**Solutions:**
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`
- Check Node.js version compatibility (v16+)
- Verify all dependencies are properly installed
- Check for conflicting package versions

#### 5. Real-time Features Not Working
**Problem:** Messages not updating in real-time or breadcrumb menu not working
**Solutions:**
- Check browser console for Socket.IO errors
- Verify socket connection status
- Restart both frontend and backend servers
- Check network connectivity
- Verify event listeners are properly set up

#### 6. Reply/Forward Functionality Issues
**Problem:** Reply or forward features not working properly
**Solutions:**
- Check if ForwardModal component is properly imported
- Verify user list is being passed to ChatWindow
- Check console for JavaScript errors
- Ensure all required props are being passed
- Verify socket events are properly handled

### Debug Mode
Enable debug logging by setting environment variables:
```bash
# Backend debugging
DEBUG=socket.io:* npm run dev

# Frontend debugging
# Open browser DevTools and check Console tab
# Enable verbose logging in socket service
```

## Development

### Backend Development
```bash
cd server
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd client
npm run dev  # Uses Vite for hot reload
```

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a strong JWT_SECRET
3. Use a production MongoDB instance
4. Build the frontend: `npm run build`
5. Serve the built files with a web server

## 🆕 Recent Updates

### Version 2.0 Features
- **✅ File Sharing System:** Added + icon for sharing images, PDFs, and text files (up to 500KB)
- **✅ Message Read Status:** Implemented visual tick icons (grey/blue) with real-time updates
- **✅ Enhanced Forward System:** Updated to forward to conversations instead of individual users
- **✅ Improved UI/UX:** Better file preview, download functionality, and responsive design

### Technical Improvements
- **Database Schema:** Added `readBy` field to Message model for read tracking
- **Socket Events:** New `markMessagesAsRead` and `messagesRead` events
- **File Handling:** Base64 encoding for file transmission with metadata preservation
- **Real-time Updates:** Instant tick icon color changes when messages are read
- **Validation:** Client-side file type and size validation with user feedback

### New Components
- **File Attachment Interface:** + icon with file preview and validation
- **Read Status Indicators:** Visual tick icons with real-time updates
- **Enhanced Message Display:** Support for mixed content (text + files)
- **Improved Forward Modal:** Conversation-based forwarding with search

## License

This project is for educational purposes.
