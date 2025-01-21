import { user } from '../model/user.js'; // Import the user model
import bcrypt from 'bcryptjs';
import { generateToken } from '../jwt/auth.js';
import { OAuth2Client } from 'google-auth-library';
import { Subscription } from '../model/subscription.js';

const promoCodes = {
  'DISCOUNT10': 10, // 10% discount
  'DISCOUNT20': 20  // 20% discount
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const createUser = async (req, res) => {
  try {
    console.log('Incoming request data:', req.body);

    const { firstname, lastname, phone, email, country, password } = req.body;

    // Validate input fields
    if (!firstname || typeof firstname !== 'string' || !firstname.trim()) {
      return res.status(400).json({ message: 'Firstname is required and must be a valid string.' });
    }
    if (!lastname || typeof lastname !== 'string' || !lastname.trim()) {
      return res.status(400).json({ message: 'Lastname is required and must be a valid string.' });
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'A valid email is required.' });
    }

    // Check if the user already exists
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    // Hash the password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Create a new user
    const newUser = new user({
      firstname,
      lastname,
      phone,
      email,
      country,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        phone: newUser.phone,
        country: newUser.country,
      },
      token,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};


export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user: existingUser });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

export const googleLogin = async (req, res) => {
  const { tokenId } = req.body;

  try {
    console.log('Received tokenId:', tokenId);

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    console.log('Google token payload:', payload);

    if (!payload) {
      return res.status(400).json({ error: 'Invalid token payload' });
    }

    const { email, given_name, family_name, sub } = payload;

    let existingUser = await user.findOne({ email });

    if (existingUser) {
      console.log('Existing user found:', existingUser);
      const token = generateToken(existingUser);
      return res.status(200).json({ token, user: existingUser }); // Include user data in response
    } else {
      console.log('Creating a new user');
      const newUser = new user({
        email,
        firstname: given_name,
        lastname: family_name,
        googleId: sub, // Store the Google ID
        country: 'Unknown', // Placeholder
        phone: 'Unknown', // Placeholder
        password: 'GoogleAuth', // Placeholder
        role: 'user',
      });

      existingUser = await newUser.save();


      const token = generateToken(existingUser);
      return res.status(201).json({ token, user: existingUser }); // Include user data in response
    }
  } catch (error) {
    console.error('Error during Google login:', error.message);
    return res.status(500).json({ error: 'Server error during Google login', details: error.message });
  }
};





// Login user
// Login user
// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await user.findOne({ email })

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

   
    // Compare password
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(existingUser);

    // Return user and token in response
    res.status(200).json({ message: 'Login successful', user: existingUser, token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await user.find(); // Fetch all users
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Update user by ID
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from URL parameters
    const updateData = req.body;

   

    const updatedUser = await user.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Approve user
export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedUser = await user.findByIdAndUpdate(userId, { approved: 'approved' }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User approved successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error approving user', error: error.message });
  }
};
