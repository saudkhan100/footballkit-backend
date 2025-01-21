import jwt from 'jsonwebtoken';

const SECRET_KEY = 'fa21-bse-033'; // Replace with your actual secret key

// Generate JWT token
// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      firstname: user.firstname, 
      lastname: user.lastname 
    }, 
    SECRET_KEY, 
    { expiresIn: '4h' }
  );
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

