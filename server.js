const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authenticate = require('./middleware/authenticate');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost/jobTrackerDB');

// JobApplication model import
const JobApplication = require('./models/JobApplication');
const User = require('./models/User');

app.get('/jobApplications', authenticate, async (req, res) => {
  try {
    const jobApplications = await JobApplication.find();
    const userRole = req.user.role; // Assuming you set the user role during authentication
    res.json({ jobApplications, role: userRole });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/jobApplications', authenticate, async (req, res) => {
  try {
    const newJobApplication = new JobApplication(req.body);
    await newJobApplication.save();
    res.status(201).json(newJobApplication);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/jobApplications/:id', authenticate, async (req, res) => {
  try {
    const updatedJobApplication = await JobApplication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedJobApplication);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/jobApplications/:id', authenticate, async (req, res) => {
  try {
    const deletedJobApplication = await JobApplication.findByIdAndDelete(req.params.id);
    res.json(deletedJobApplication);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token with user's role
    const token = jwt.sign({ userId: user._id, role: user.role }, 'your-secret-key', {
      expiresIn: '1h', // Token expiration time
    });

    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const user = new User({ username, password, role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
