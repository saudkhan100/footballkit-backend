import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscriptionType: { type: String, enum: ['free', 'premium'], default: 'free' },
  subscriptionStartDate: { type: Date, default: Date.now },
  subscriptionEndDate: { type: Date, required: true },
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export { Subscription };
