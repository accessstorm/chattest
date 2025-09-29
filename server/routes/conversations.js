const express = require('express');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a new group conversation
router.post('/group', auth, async (req, res) => {
  try {
    const { groupName, participants } = req.body;
    const currentUserId = req.user._id;

    // Validation
    if (!groupName || !participants || !Array.isArray(participants)) {
      return res.status(400).json({ 
        message: 'Group name and participants array are required' 
      });
    }

    if (groupName.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Group name cannot be empty' 
      });
    }

    if (participants.length === 0) {
      return res.status(400).json({ 
        message: 'At least one participant is required' 
      });
    }

    // Validate participant IDs
    const validParticipants = [];
    for (const participantId of participants) {
      if (!participantId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ 
          message: `Invalid participant ID: ${participantId}` 
        });
      }
      
      const user = await User.findById(participantId);
      if (!user) {
        return res.status(400).json({ 
          message: `User not found: ${participantId}` 
        });
      }
      
      validParticipants.push(participantId);
    }

    // Add current user to participants if not already present
    if (!validParticipants.includes(currentUserId.toString())) {
      validParticipants.push(currentUserId);
    }

    // Create the conversation
    const conversation = new Conversation({
      participants: validParticipants,
      isGroupChat: true,
      groupName: groupName.trim(),
      groupAdmin: currentUserId
    });

    await conversation.save();

    // Populate the conversation with user details
    await conversation.populate([
      { path: 'participants', select: 'username' },
      { path: 'groupAdmin', select: 'username' }
    ]);

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Create group conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all conversations for the current user
router.get('/', auth, async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find all conversations where the current user is a participant
    const conversations = await Conversation.find({
      participants: currentUserId
    })
    .populate([
      { 
        path: 'participants', 
        select: 'username',
        match: { _id: { $ne: currentUserId } } // Exclude current user from participants
      },
      { path: 'groupAdmin', select: 'username' },
      { 
        path: 'lastMessage', 
        populate: { path: 'senderId', select: 'username' }
      }
    ])
    .sort({ updatedAt: -1 });

    // Process conversations to handle one-on-one chat display
    const processedConversations = conversations.map(conv => {
      const convObj = conv.toObject();
      
      // For one-on-one chats, get the other participant
      if (!convObj.isGroupChat) {
        const otherParticipant = convObj.participants.find(p => p._id.toString() !== currentUserId.toString());
        convObj.otherParticipant = otherParticipant;
      }
      
      return convObj;
    });

    res.json(processedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get or create a one-on-one conversation
router.post('/direct', auth, async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const currentUserId = req.user._id;

    // Validation
    if (!otherUserId) {
      return res.status(400).json({ message: 'Other user ID is required' });
    }

    if (!otherUserId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (otherUserId === currentUserId.toString()) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }

    // Check if the other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId] },
      isGroupChat: false
    })
    .populate([
      { path: 'participants', select: 'username' },
      { 
        path: 'lastMessage', 
        populate: { path: 'senderId', select: 'username' }
      }
    ]);

    // If conversation doesn't exist, create it
    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, otherUserId],
        isGroupChat: false
      });

      await conversation.save();
      await conversation.populate([
        { path: 'participants', select: 'username' }
      ]);
    }

    // Add otherParticipant for one-on-one chats
    const convObj = conversation.toObject();
    const otherParticipant = convObj.participants.find(p => p._id.toString() !== currentUserId.toString());
    convObj.otherParticipant = otherParticipant;

    res.json(convObj);
  } catch (error) {
    console.error('Get or create direct conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages for a specific conversation
router.get('/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    // Validate conversationId
    if (!conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }

    // Check if user is a participant in this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: currentUserId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Get messages for this conversation
    const messages = await Message.find({
      conversationId: conversationId
    })
    .populate('senderId', 'username')
    .populate('readBy', 'username')
    .sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
