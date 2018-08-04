
const mongoose = require('../../database/index');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({

    active: {
        type: Boolean,
    },
    role: {
        type: String,
        require: true,
    },
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        lowercase: true,
        require: true,
        unique: true,
        select: false,
    },
    tel: {
        type: String,
    },
    password: {
        type: String,
        require: true,
        select: false,
    },
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: String,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

});

UserSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;