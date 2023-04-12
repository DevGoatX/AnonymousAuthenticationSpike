import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from "uuid";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: 'http://your-frontend-domain.com', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Secret key for JWT tokens
const secretKey = process.env.JWT_SECRET || 'your-secret-key';

// In-memory storage for anonymous user IDs
const anonymousUsers = new Map<string, boolean>();

interface PAYLOAD {
  anonymousUserId: string,
  iat?: number
}

app.post('/api/auth/anonymous', (req, res) => {
  // Check if the client sent a token cookie
  const tokenCookie = req.cookies.anonymousToken;
  console.log('-------- token cookie: ', tokenCookie)

  if (tokenCookie) {
    try {
      // Verify the existing token and extract the anonymous user ID
      const verifyToken: PAYLOAD = jwt.verify(tokenCookie, secretKey) as PAYLOAD;

      console.log('-------- verifyToken: ', verifyToken)

      // Check if the anonymous user ID is stored on the server-side
      if (anonymousUsers.has(verifyToken.anonymousUserId)) {
        return res.json({ 
          success: true,
          message: "Welcome back!" 
        });
      }
    } catch (err) {
      // The existing token is invalid or expired, so ignore it and generate a new one
    }
  }

  // Generate a unique anonymous user ID
  const anonymousUserId = uuidv4();

  // Store the anonymous user ID on the server-side
  anonymousUsers.set(anonymousUserId, true);

  const payload: PAYLOAD = {
    anonymousUserId: anonymousUserId
  }

  // Generate a JWT token with the anonymous user ID as the payload
  const token = jwt.sign(payload, secretKey);

  // Set a token cookie that expires in 7 days
  res.cookie("anonymousToken", token, { 
    secure: true,   // Set to true for HTTPS
    httpOnly: true,
    maxAge: 30 * 365 * 24 * 60 * 60 * 1000, 
  });

  // Send a welcome message to the client
  res.json({ 
    success: true,
    message: "Welcome!" 
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});