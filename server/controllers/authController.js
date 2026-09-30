const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logAuditAction = require('../utils/auditLogger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_water_treatment_2026', {
    expiresIn: '30d'
  });
};

// @desc Auth user & get token
// @route POST /api/auth/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      if (!user.active) {
        return res.status(401).json({ message: 'User account is deactivated' });
      }

      const token = generateToken(user._id);

      await logAuditAction({
        userId: user._id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user._id,
        details: `User ${user.email} logged in successfully`,
        req
      });

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Get user profile
// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = { loginUser, getMe };
