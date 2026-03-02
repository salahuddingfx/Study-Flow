const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { protect } = require('../middleware/auth.middleware');

// @desc    Get all notes
// @route   GET /api/notes
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        // Debug Log
        console.log(`[GET /api/notes] Fetching notes for user: ${req.user.id}`);
        
        const notes = await Note.find({ user: req.user.id }).sort({ isPinned: -1, updatedAt: -1 });
        res.status(200).json({ success: true, count: notes.length, data: notes });
    } catch (err) {
        console.error('Error fetching notes:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }

        // Make sure user owns the note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to access this note' });
        }

        res.status(200).json({ success: true, data: note });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        // Add user to req.body
        req.body.user = req.user.id;

        const note = await Note.create(req.body);

        res.status(201).json({ success: true, data: note });
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        let note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }

        // Make sure user owns the note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to update this note' });
        }

        note = await Note.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: note });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }

        // Make sure user owns the note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to delete this note' });
        }

        await note.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
