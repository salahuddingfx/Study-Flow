const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Task = require('../models/Task');

// Get io instance
let io;
const setIo = (socketIo) => {
    io = socketIo;
};
module.exports.setIo = setIo;

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
router.post('/', protect, async (req, res) => {
    // Support both 'title' (new) and 'text' (legacy)
    const title = req.body.title || req.body.text;
    
    if (!title) {
        return res.status(400).json({ message: 'Title is required' });
    }

    try {
        const task = await Task.create({
            user: req.user.id,
            title: title,
            deadline: req.body.deadline || null,
            priority: req.body.priority || 'medium',
            completed: false
        });

        // Emit real-time event
        if (io) {
            io.to(`user_${req.user.id}`).emit('task-created', task);
        }

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    const { completed } = req.body;

    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.user.toString() !== req.user.id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        task.completed = completed !== undefined ? completed : task.completed;
        const updatedTask = await task.save();

        // Emit real-time event
        if (io) {
            io.to(`user_${req.user.id}`).emit('task-updated', updatedTask);
        }

        res.json(updatedTask);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid task ID' });
        }
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.user.toString() !== req.user.id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Task.findByIdAndDelete(req.params.id);

        // Emit real-time event
        if (io) {
            io.to(`user_${req.user.id}`).emit('task-deleted', req.params.id);
        }

        res.json({ message: 'Task removed' });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid task ID' });
        }
        res.status(500).json({ message: error.message });
    }
});

// @desc    Sync offline task operations
// @route   POST /api/tasks/sync
// @access  Private
router.post('/sync', protect, async (req, res) => {
    const { operations = [] } = req.body;
    const results = [];

    try {
        for (const op of operations) {
            if (op.type === 'create') {
                const title = op.data?.title || op.data?.text;
                if (!title) {
                    results.push({ clientId: op.clientId, error: 'Title is required' });
                    continue;
                }
                const task = await Task.create({
                    user: req.user.id,
                    title,
                    description: op.data?.description,
                    deadline: op.data?.deadline || null,
                    priority: op.data?.priority || 'medium',
                    completed: !!op.data?.completed
                });
                if (io) io.to(`user_${req.user.id}`).emit('task-created', task);
                results.push({ clientId: op.clientId, task });
            } else if (op.type === 'update') {
                const task = await Task.findById(op.id);
                if (!task || task.user.toString() !== req.user.id.toString()) {
                    results.push({ id: op.id, error: 'Task not found' });
                    continue;
                }
                if (op.data?.title) task.title = op.data.title;
                if (op.data?.description !== undefined) task.description = op.data.description;
                if (op.data?.deadline !== undefined) task.deadline = op.data.deadline;
                if (op.data?.priority) task.priority = op.data.priority;
                if (op.data?.completed !== undefined) task.completed = op.data.completed;
                const updatedTask = await task.save();
                if (io) io.to(`user_${req.user.id}`).emit('task-updated', updatedTask);
                results.push({ id: op.id, task: updatedTask });
            } else if (op.type === 'delete') {
                const task = await Task.findById(op.id);
                if (!task || task.user.toString() !== req.user.id.toString()) {
                    results.push({ id: op.id, error: 'Task not found' });
                    continue;
                }
                await Task.findByIdAndDelete(op.id);
                if (io) io.to(`user_${req.user.id}`).emit('task-deleted', op.id);
                results.push({ id: op.id, deleted: true });
            }
        }

        const tasks = await Task.find({ user: req.user.id });
        res.json({ success: true, results, tasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
module.exports.setIo = setIo;