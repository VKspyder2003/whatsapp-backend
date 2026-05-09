const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    aud: {
        type: String
    },
    azp: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    email_verified: {
        type: Boolean,
        default: false
    },
    exp: {
        type: Number
    },
    family_name: {
        type: String,
        default: ''
    },
    given_name: {
        type: String,
        default: ''
    },
    iat: {
        type: Number
    },
    iss: {
        type: String
    },
    jti: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    nbf: {
        type: Number
    },
    picture: {
        type: String,
        default: ''
    },
    sub: {
        type: String,
        required: true,
        unique: true
    },
    about: {
        type: String,
        default: ''
    },
    joinedAt: {
        type: Date,
        default: Date.now,
        immutable: true
    }
})

const user = mongoose.model('user', userSchema)

module.exports = user
