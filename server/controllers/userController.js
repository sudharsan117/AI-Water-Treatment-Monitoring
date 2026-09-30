const User = require('../models/User');
const logAuditAction = require('../utils/auditLogger');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({ name, email, password, role });

    await logAuditAction({
      userId: req.user._id,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user._id,
      details: `Admin created user ${user.email} (${user.role})`,
      req
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, active, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (active !== undefined) user.active = active;
    if (password) user.password = password;

    await user.save();

    await logAuditAction({
      userId: req.user._id,
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: user._id,
      details: `Updated user ${user.email}`,
      req
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, createUser, updateUser };
