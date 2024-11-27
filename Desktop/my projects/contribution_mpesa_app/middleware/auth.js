const jwt = require('jsonwebtoken');
const User = require('../models/models');

const protect = async (req, res, next) => {
    let token;
 
    if (req.cookies.token) {
        token = req.cookies.token 

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');
            
            return next();

        } catch (error) {
            console.error(error.message);
            return res.status(401).json({ error: 'Not authorized, invalid token' });
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }
};

module.exports = { protect };
