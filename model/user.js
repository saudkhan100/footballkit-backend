// user.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  phone: { type: String,  },
  email: { type: String, required: true, unique: true },
  password: { type: String,  },
  googleId: { type: String },
  country: { type: String,  },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});


const user = mongoose.model("User", userSchema);

export { user };
