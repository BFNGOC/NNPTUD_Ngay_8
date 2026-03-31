var express = require('express');
var router = express.Router();
let messageModel = require('../schemas/messages');
let userModel = require('../schemas/users');
let { CheckLogin } = require('../utils/authHandler');
let { uploadImage } = require('../utils/uploadHandler');

// GET "/messages/" - Get latest message from each user
router.get('/', CheckLogin, async function (req, res, next) {
    try {
        let currentUserId = req.user._id;

        // Get all conversation partners (both sent and received)
        let sentMessages = await messageModel
            .find({ from: currentUserId, isDeleted: false })
            .select('to')
            .distinct('to');

        let receivedMessages = await messageModel
            .find({ to: currentUserId, isDeleted: false })
            .select('from')
            .distinct('from');

        // Combine and deduplicate conversation partners
        let conversationPartners = [...new Set([...sentMessages, ...receivedMessages])];

        // Get latest message with each partner
        let latestMessages = [];
        for (let partnerId of conversationPartners) {
            let message = await messageModel
                .findOne({
                    $or: [
                        { from: currentUserId, to: partnerId },
                        { from: partnerId, to: currentUserId },
                    ],
                    isDeleted: false,
                })
                .sort({ createdAt: -1 })
                .populate('from', 'username fullName avatarUrl')
                .populate('to', 'username fullName avatarUrl');

            if (message) {
                latestMessages.push(message);
            }
        }

        // Sort by createdAt descending
        latestMessages.sort((a, b) => b.createdAt - a.createdAt);

        res.send(latestMessages);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// GET "/messages/:userID" - Get all messages between current user and specified userID
router.get('/:userID', CheckLogin, async function (req, res, next) {
    try {
        let currentUserId = req.user._id;
        let otherUserId = req.params.userID;

        // Validate userID exists
        let user = await userModel.findById(otherUserId);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Get all messages between the two users (both directions)
        let messages = await messageModel
            .find({
                $or: [
                    { from: currentUserId, to: otherUserId },
                    { from: otherUserId, to: currentUserId },
                ],
                isDeleted: false,
            })
            .sort({ createdAt: 1 })
            .populate('from', 'username fullName avatarUrl')
            .populate('to', 'username fullName avatarUrl');

        res.send(messages);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST "/messages/" - Create a new message
router.post('/', CheckLogin, uploadImage.single('file'), async function (req, res, next) {
    try {
        let currentUserId = req.user._id;
        let toUserId = req.body.to;
        let messageText = req.body.text;

        // Validate toUserId exists
        let user = await userModel.findById(toUserId);
        if (!user) {
            return res.status(404).send({ message: 'Recipient user not found' });
        }

        let messageContent = {};

        // Determine message type based on whether file exists
        if (req.file) {
            // File upload
            messageContent.type = 'file';
            messageContent.text = req.file.path || req.file.filename;
        } else if (messageText) {
            // Text message
            messageContent.type = 'text';
            messageContent.text = messageText;
        } else {
            return res
                .status(400)
                .send({ message: 'Either file upload or text content is required' });
        }

        // Create new message
        let newMessage = await messageModel.create({
            from: currentUserId,
            to: toUserId,
            messageContent: messageContent,
        });

        // Populate the message with user details
        let populatedMessage = await messageModel
            .findById(newMessage._id)
            .populate('from', 'username fullName avatarUrl')
            .populate('to', 'username fullName avatarUrl');

        res.send(populatedMessage);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
