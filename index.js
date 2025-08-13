const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const port = process.env.PORT || 5058;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send(`Boss is sitting on port ${port}`);
});

// MongoDB Connection
const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('❌ MONGO_URI not found in .env file');
  process.exit(1);
}

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// Mongoose Schema and Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  provider: { type: String, default: "email/password" },
  role: {
    type: String,
    enum: ["user", "admin", "moderator"],
    default: "user"
  }
});

const User = mongoose.model('User', userSchema);

// Routes

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ _id: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, provider, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = new User({
      name,
      email,
      provider,
      role: ["user", "admin", "moderator"].includes(role) ? role : "user"
    });

    await newUser.save();
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, email, provider, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ error: 'Email already in use' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.provider = provider || user.provider;

    if (role && ["user", "admin", "moderator"].includes(role)) {
      user.role = role;
    }

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
