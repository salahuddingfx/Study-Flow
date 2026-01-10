const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { admin } = require('../middleware/admin.middleware');

let io;
const setIo = (socketIo) => {
    io = socketIo;
};

router.get('/', async (req, res) => {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.json(blogs);
});

router.post('/', admin, async (req, res) => {
    const { title, content, image } = req.body;
    const blog = await Blog.create({ title, content, image });
    
    // Emit real-time event
    if (io) {
        io.emit('blog-created', blog);
    }
    
    res.json(blog);
});

router.delete('/:id', admin, async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    
    // Emit real-time event
    if (io) {
        io.emit('blog-deleted', req.params.id);
    }
    
    res.json({ message: 'Blog deleted' });
});

module.exports = router;
module.exports.setIo = setIo;