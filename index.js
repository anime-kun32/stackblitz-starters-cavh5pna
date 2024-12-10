const express = require('express');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// Enable CORS for all origins (adjust as needed)
app.use(cors({ origin: '*' }));

// Initialize Firebase Admin SDK with proper error handling
try {
  const serviceAccount = require('./serviceAccountKey.json'); // Replace with your service account key file
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1); // Exit on error
}

// Define your API endpoint
app.post('/generateToken', async (req, res) => {
  try {
    // 1. Validate Request Body:
    if (!req.body.uid || !req.body.email) {
      return res.status(400).json({ error: 'Missing uid or email in request' });
    }

    // Destructure after validation to ensure uid is defined
    const { uid, email } = req.body;

    // 2. Create a custom token:
    const token = await admin.auth().createCustomToken(uid, {
      email: email,
    });

    // 3. Set token expiration (optional):
    const expiration = 60 * 60 * 24; // 1 day in seconds
    const jwtToken = jwt.sign({ uid, email }, process.env.JWT_SECRET, {
      expiresIn: expiration,
    });

    // 4. Send the token as a response:
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
