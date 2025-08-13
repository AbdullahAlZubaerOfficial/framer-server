import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Add 'role' field with default 'user'
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  provider: { type: String, default: "email/password" },
  role: { type: String, enum: ["user", "admin", "moderator"], default: "user" },  // Added role
});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.send("API is running");
});

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().sort({ _id: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user by ID
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Create new user
app.post("/api/users", async (req, res) => {
  try {
    const { name, email, provider, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Only allow roles in enum, fallback default 'user'
    const newUser = new User({ 
      name, 
      email, 
      provider, 
      role: ["user", "admin", "moderator"].includes(role) ? role : "user" 
    });
    await newUser.save();
    res.json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update user by ID
app.put("/api/users/:id", async (req, res) => {
  try {
    const { name, email, provider, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ error: "User not found" });

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists)
        return res.status(400).json({ error: "Email already in use" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.provider = provider || user.provider;

    // Update role only if valid
    if (role && ["user", "admin", "moderator"].includes(role)) {
      user.role = role;
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user by ID
app.delete("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));