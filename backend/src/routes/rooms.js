const express = require('express');
const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
const Room = require('../models/Room');
const Problem = require('../models/Problem');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { problemId, password } = req.body;

        if (!problemId) {
            return res.status(400).json({ error: 'problemId is required' });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        const roomId = nanoid(8);

        const newRoom = new Room({
            roomId,
            problemId,
            password: password || undefined,
            participants: [{
                userId: req.user.userId,
                username: req.user.username
            }]
        });

        await newRoom.save();

        res.json({ roomId: newRoom.roomId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create room' });
    }
});

router.post('/join', authMiddleware, async (req, res) => {
    try {
        const { roomId, password } = req.body;

        if (!roomId) {
            return res.status(400).json({ error: 'roomId is required' });
        }

        const room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        if (room.password && room.password !== password) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const isParticipant = room.participants.some(p => p.userId.toString() === req.user.userId);

        if (!isParticipant) {
            room.participants.push({
                userId: req.user.userId,
                username: req.user.username
            });
            await room.save();
        }

        // Return room object
        res.json(room);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to join room' });
    }
});

router.get('/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findOne({ roomId }).populate('problemId');
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.json(room);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to find room' });
    }
});

module.exports = router;