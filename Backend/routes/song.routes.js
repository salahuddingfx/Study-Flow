const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const { admin } = require('../middleware/admin.middleware');

let io;
const setIo = (socketIo) => {
    io = socketIo;
};

router.get('/', async (req, res) => {
    const songs = await Song.find({});
    res.json(songs);
});

router.post('/', admin, async (req, res) => {
    const { title, url, category } = req.body;
    const song = await Song.create({ title, url, category });
    
    // Emit real-time event
    if (io) {
        io.emit('song-created', song);
    }
    
    res.json(song);
});

router.delete('/:id', admin, async (req, res) => {
    await Song.findByIdAndDelete(req.params.id);
    
    // Emit real-time event
    if (io) {
        io.emit('song-deleted', req.params.id);
    }
    
    res.json({ message: 'Song deleted' });
});

module.exports = router;
module.exports.setIo = setIo;