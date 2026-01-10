const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: String,
    lastName: String,
    profileImage: String,
    // Role field for admin/user access control
    role: {
        type: String,
        enum: ['user', 'admin'], // Only 'user' or 'admin' roles allowed
        default: 'user'          // Defaults to 'user' role
    }
}, { timestamps: true });

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);