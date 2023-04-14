import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from "uuid";
import { PAYLOAD, USERITEM } from './types';
import { serverAddress, port, secretKey, userDBFileName } from './config';

const fs = require('fs');
const app = express();

app.use(express.json());
app.use(cookieParser());

const ANONYUSER_NAME = 'Anony User';

// In-memory storage for anonymous user IDs
const anonymousUserMap = new Map<string, boolean>();

fs.access(userDBFileName, fs.constants.F_OK, (err: any) => {
  if (err) {
    // user db does not exist, so create it
    fs.writeFile(userDBFileName, '', (err: any) => {
      if (err)  throw err;
      console.log('--- User DB File has been created!')
    })

  } else {
    // File exists, so do nothing
    console.log('--- User DB File already exists')
  }
})

// Allow requests from all origins
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin!!);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

app.post('/api/auth/anonymous', (req, res) => {
  // Check if the client sent a token cookie
  const tokenCookie = req.cookies.anonymousToken;
  console.log('-------- token cookie: ', tokenCookie)

  const anonymousUserMap = new Map<string, boolean>();

  let anonymousUserList: USERITEM[] = []

  // get already registered user list
  try {
    const data = fs.readFileSync(userDBFileName, 'utf8');
    const users: USERITEM[] = JSON.parse(data) as USERITEM[];

    anonymousUserList = users.filter((user) => user.name == ANONYUSER_NAME);
    anonymousUserList.map(user => anonymousUserMap.set(user.id, true));

  } catch (e) {
    console.log('-------- cannot read the user database file -------- ')
  }

  if (tokenCookie) {
    try {
      
      // Verify the existing token and extract the anonymous user ID
      const verifyToken: PAYLOAD = jwt.verify(tokenCookie, secretKey) as PAYLOAD;

      // Check if the anonymous user ID is stored on the server-side
      if (anonymousUserMap.has(verifyToken.anonymousUserId)) {
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
  anonymousUserMap.set(anonymousUserId, true);

  anonymousUserList.push({
    id: anonymousUserId,
    name: ANONYUSER_NAME,
    typeName: 'user',
    locale: 'en'
  })
  fs.writeFileSync(userDBFileName, JSON.stringify(anonymousUserList));

  const payload: PAYLOAD = {
    anonymousUserId: anonymousUserId
  }
  // Generate a JWT token with the anonymous user ID as the payload
  const token = jwt.sign(payload, secretKey);

  // Set a token cookie that expires in 7 days
  res.cookie("anonymousToken", token, { 
    // secure: true,   // Set to true for HTTPS
    httpOnly: true,
    maxAge: 30 * 365 * 24 * 60 * 60 * 1000, 
  });

  // Send a welcome message to the client
  res.json({ 
    success: true,
    message: "Welcome!",
    anonymousToken: token,
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});