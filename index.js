const express = require('express');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// Enable CORS for all origins (adjust as needed)
app.use(cors({ origin: '*' }));

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Define your API endpoint
app.post('/generateToken', async (req, res) => {
  try {
    const { uid, email } = req.body; // Get user data from request body

    // Create a custom token
    const token = await admin.auth().createCustomToken(uid, {
      email: email,
    });

    // Set token expiration (optional)
    const expiration = 60 * 60 * 24; // 1 day in seconds
    const jwtToken = jwt.sign({ uid, email }, process.env.JWT_SECRET, {
      expiresIn: expiration,
    });

    res.json({ token: jwtToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
