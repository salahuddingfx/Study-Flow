const jwt = require('jsonwebtoken');
const User = require('../models/User');

const admin = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            
            if (user && user.role === 'admin') {
                req.user = user;
                next();
            } else {
                res.status(403).json({ message: 'Not authorized as admin' });
            }
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'No token provided' });
    }
};

module.exports = { admin };