const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'you should type your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'you should provide you e-mail'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please give a valid e-mail']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        // This works only on SAVE
        validate : {
            validator: function(el) {
                return el === this.password;
            },
            message: 'Password are not the same'
        }
    },
    passwordCangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordCangedAt = Date.now();
    next();
})

userSchema.pre(/^find/, function(next){
    // this points to the current query
    this.find({active: { $ne : false }})
    next()
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTimestamp) {
    if (this.passwordCangedAt){
        const changedTimestamp = parseInt(this.passwordCangedAt.getTime()/1000, 10);
        
        return JWTimestamp < changedTimestamp;
    }
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;

}

const User = mongoose.model('User', userSchema);
module.exports = User;