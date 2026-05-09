const User = require('../modal/User.js')

const getNormalizedUser = (data) => ({
    aud: data.aud,
    azp: data.azp,
    email: data.email,
    email_verified: Boolean(data.email_verified),
    exp: data.exp,
    family_name: data.family_name || '',
    given_name: data.given_name || '',
    iat: data.iat,
    iss: data.iss,
    jti: data.jti,
    name: data.name || data.email,
    nbf: data.nbf,
    picture: data.picture || '',
    sub: data.sub
});

const addUser = async (req, res) => {
    try {
        const userData = getNormalizedUser(req.body);

        if (!userData.sub || !userData.email || !userData.name) {
            res.status(400).json({ message: 'Google profile is missing required account details.' });
            return;
        }

        let exist = await User.findOne({ sub: userData.sub });

        if (exist) {
            const updatedUser = await User.findOneAndUpdate(
                { sub: userData.sub },
                {
                    ...userData,
                    about: exist.about || ''
                },
                { new: true }
            );

            res.status(200).json(updatedUser);
            return;
        }

        const newUser = new User(userData);
        await newUser.save();
        res.status(200).json(newUser);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Unable to add user.' });
    }
}

const getUser = async (req, res) => {
    try {
        const user = await User.find({}).sort({ joinedAt: -1 });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json(error);
    }
}

const updateUserStatus = async (req, res) => {
    try {
        const { sub, about } = req.body;

        if (!sub) {
            res.status(400).json({ message: 'User id is required.' });
            return;
        }

        const statusMessage = typeof about === 'string' ? about.trim().slice(0, 140) : '';
        const user = await User.findOneAndUpdate(
            { sub },
            { about: statusMessage },
            { new: true }
        );

        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json(error);
    }
}

module.exports = { addUser, getUser, updateUserStatus }
