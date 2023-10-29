const User = require('../modal/User.js')

const addUser = async (req, res) => {
    try {
        let exist = await User.findOne({ sub: req.body.sub });

        if (exist) {
            res.status(200).json('User already exists');
            return;
        }

        const newUser = new User(req.body);
        await newUser.save();
        res.status(200).json(newUser);
    } catch (error) {
        res.status(500).json(error);
    }
}

const getUser = async (req, res) => {
    try {
        const user = await User.find({});
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json(error);
    }
}

module.exports = { addUser, getUser }
