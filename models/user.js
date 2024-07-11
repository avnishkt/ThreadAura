const mongoose = require('mongoose');
const schema = mongoose.Schema();

const userSchema = new schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
    },
    email: {
        type: String,
        required: true,
        // unique: true,
        validate: {
            validator: function (value) {
                const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                return emailRegex.test(value);
            },
            message: props => `${props.value} is not a valid email address.`
        }

    },
    password: {
        type: String,
        required: true
    }
    ,
    profilePic: {
        type: String
    }
    ,

}
    , {
        timestamps: true
    })

const user = mongoose.model('user', userSchema);
module.exports = user;