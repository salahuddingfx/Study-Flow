const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { 
        type: String, 
        enum: ['Study Related', 'Motivational', 'Others'],
        default: 'Study Related' 
    },
    image: { type: String },
    author: { type: String, default: 'Admin' }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);