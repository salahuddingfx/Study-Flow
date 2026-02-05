const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema({
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actorUsername: { type: String, required: true },
    action: { type: String, required: true },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    targetUsername: { type: String },
    metadata: { type: Object, default: {} },
    ip: { type: String },
    userAgent: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
