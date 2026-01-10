const mongoose = require('mongoose');

const songSchema = mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    category: { type: String, default: 'Focus' },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Song', songSchema);