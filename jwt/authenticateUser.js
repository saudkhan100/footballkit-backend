// middleware/auth.js
import jwt from 'jsonwebtoken';
import { User } from '../model/user';  // Replace with the actual user model path

const authenticateUser = (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Ensure the key is correct

    // Attach the user to the request object
    req.user = decoded;  // Attach the decoded user data here

    // Proceed to the next middleware or route
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default authenticateUser;
