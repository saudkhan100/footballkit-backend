import { user } from '../model/user.js';
import { Subscription } from '../model/subscription.js';

export const renewSubscription = async (req, res) => {
  try {
    const { userId, newSubscriptionType } = req.body; // promoCode is removed from parameters
    const User = await user.findById(userId).populate('subscription');

    if (!User) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Determine pricing based on the subscription type
    let originalPrice = newSubscriptionType === 'premium' ? 20 : 0; // Example: $20 per month for premium, $0 for basic

    // Determine the new subscription end date
    const newEndDate = newSubscriptionType === 'basic'
      ? new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000) // 3 months for basic
      : new Date(Date.now() + 1 * 30 * 24 * 60 * 60 * 1000); // 1 month for premium

    // Create a new subscription
    const newSubscription = new Subscription({
      userId: User._id,
      subscriptionType: newSubscriptionType,
      subscriptionEndDate: newEndDate,
    });

    await newSubscription.save();

    // Update the user with the new subscription ID
    User.subscription = newSubscription._id;
    await User.save();

    res.status(200).json({ message: 'Subscription renewed successfully', user: User, originalPrice });
  } catch (error) {
    res.status(500).json({ message: 'Error renewing subscription', error: error.message });
  }
};