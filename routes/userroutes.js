import express from 'express';
import { createUser, loginUser,getUserByEmail,googleLogin,getAllUsers,updateUser,approveUser } from '../controller/usercontroller.js';
import { authenticateJWT } from './authmiddleware.js';
import { renewSubscription } from '../controller/subscriptioncontroller.js';

const router = express.Router();



router.post('/users', createUser);
router.post('/login', loginUser); 
router.post('/google-login', googleLogin);
router.get('/users/:email', authenticateJWT, getUserByEmail);
router.put('/users/:userId', updateUser);
router.get('/users', authenticateJWT, getAllUsers);
router.put('/users/:userId/approve', approveUser);
router.post('/users/:userId/renew-subscription', renewSubscription);



export default router;
