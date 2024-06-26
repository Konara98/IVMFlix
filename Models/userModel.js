const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name']
    },
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    photo: String,
    role: {
        type: String,
        enum: {
            values: ["user", "admin"],
            message: 'This role does not exist'
        },
        default: "user"
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your password'],
        //validator will work on save() or create() methods
        validate: {
            validator: function(value){
                return value === this.password;
            },
            message: 'Password and confirm password does not match'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpire: Date
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
})

//Instance method which can be call from anywhere
userSchema.methods.comparePasswordInDb = async function(paswd, paswdDB){
    return await bcrypt.compare(paswd, paswdDB);
}

userSchema.methods.isPasswordChanged = async function(JWTTimeStamp){
    if(this.passwordChangedAt){
        const passwordChangedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000);
        return JWTTimeStamp < passwordChangedTimeStamp;
    } else{
        return false;
    }
}

userSchema.methods.createResetPasswordToken = async function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const User = mongoose.model('user', userSchema);

module.exports = User;