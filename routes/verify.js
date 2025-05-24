const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');
const User = require('../models/user');
const { generateOTP, sendOTPEmail } = require('../utilis/otpUtils');

// Show verification form
router.get('/verify', (req, res) => {
    const { email, userType } = req.query;
    res.render('verify', { email, userType, error: null });
});

// Handle OTP verification
router.post('/verify', async (req, res) => {
    const { email, otp, userType } = req.body;
    const Model = userType === 'customer' ? Customer : User;

    try {
        const user = await Model.findOne({ email });
        
        if (!user) {
            return res.render('verify', { 
                email, 
                userType, 
                error: 'User not found' 
            });
        }

        if (user.isVerified) {
            return res.redirect('/login');
        }

        if (!user.otp || !user.otpExpiry) {
            return res.render('verify', { 
                email, 
                userType, 
                error: 'OTP expired. Please request a new one.' 
            });
        }

        if (user.otp !== otp) {
            return res.render('verify', { 
                email, 
                userType, 
                error: 'Invalid OTP' 
            });
        }

        if (Date.now() > user.otpExpiry) {
            return res.render('verify', { 
                email, 
                userType, 
                error: 'OTP expired. Please request a new one.' 
            });
        }

        // Update user verification status
        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        req.flash('success', 'Email verified successfully! Please login.');
        if (userType === 'customer') {
            return res.redirect('/customer/login');
        } else {
            return res.redirect('/login');
        }
    } catch (error) {
        console.error('Verification error:', error);
        res.render('verify', { 
            email, 
            userType, 
            error: 'An error occurred. Please try again.' 
        });
    }
});

// Resend OTP
router.get('/resend-otp', async (req, res) => {
    const { email, userType } = req.query;
    const Model = userType === 'customer' ? Customer : User;

    try {
        const user = await Model.findOne({ email });
        
        if (!user) {
            return res.render('verify', { 
                email, 
                userType, 
                error: 'User not found' 
            });
        }

        if (user.isVerified) {
            return res.redirect('/login');
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Update user with new OTP
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send new OTP email
        const emailSent = await sendOTPEmail(email, otp);
        
        if (!emailSent) {
            return res.render('verify', { 
                email, 
                userType, 
                error: 'Failed to send OTP. Please try again.' 
            });
        }

        req.flash('success', 'New OTP sent successfully!');
        res.render('verify', { 
            email, 
            userType, 
            error: null 
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.render('verify', { 
            email, 
            userType, 
            error: 'An error occurred. Please try again.' 
        });
    }
});

module.exports = router; 