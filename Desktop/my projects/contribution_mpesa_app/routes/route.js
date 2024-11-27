const express = require('express');
const route = express.Router();
const generateToken = require('../middleware/accessToken')
const { default: axios } = require('axios');
const jwt = require('jsonwebtoken');
const {User, Contribution} = require('../models/schema')
const bcrypt = require('bcrypt');
const flash = require('connect-flash');

// Generate JWT Token
const getToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

function isAuthenticated(req, res, next) {  
    if(req.session.user){
        return next()
    }

    req.flash('error', 'Please log in to view this resource');
    res.redirect('/contribution');
}
 
// Login Page
route.get('/', (req, res) => {
    res.status(200).render('../views/auth/login', { 
        success: null,
        error: null,
        results: null
    });
});

// Login Route
route.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).render('../views/auth/login', {
            error: "Please fill all the fields",
            success: null,
            timeout: 3000,
        });
    }

    try {

        const isExisting = await User.findOne({email})
        if(isExisting){
            const isValidPassword = await bcrypt.compare(password, isExisting.password);
            if (isValidPassword) {
                req.session.user = { id:isExisting._id, name:isExisting.name, email:isExisting.email }
                req.flash('success', 'Login successful')

               return res.status(200).redirect('/contribution/dashboard')

            }
            return res.status(500).render('../views/auth/login', {
                success:null,
                error:"Invalid credentials"
            })
    
 
        } else{
            return res.status(500).render('../views/auth/login', {
                success:null,
                error:"The email doesn't exist" 
            })
        }
        
    } catch (error) { 
        console.log("Error adding this user", error.message);
         
    }
});

// Signup Page
route.get('/signup', (req, res) => {
    res.status(200).render('../views/auth/signup', {
        error: null,
        success: null,
    });
});

// Signup Route
route.post('/signup', async (req, res) => {
    const { name, email, password, confirm } = req.body;

    if (!name || !email || !password || !confirm) {
        return res.status(400).render('../views/auth/signup', {
            success: null,
            error: "Please fill all the fields",
        });
    }

    if (password !== confirm) {
        return res.status(400).render('../views/auth/signup', {
            success: null,
            error: "The passwords do not match",
        });
    }

    const isExisting = await User.findOne({email}) 
    if(isExisting){
        return res.status(500).render('../views/auth/signup', {
            success: null,
            error: "Email already exists",
        })
    }

    try {
       
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({name, email, password:hashedPassword})
        await user.save();
       return res.status(200).redirect('/contribution/')
        

    } catch (error) {
        console.log(`Server error: ${error.message}`);
        res.status(500).render('../views/auth/signup', {
            error: `Server Error: ${error.message}`,
            success: null,
        });
    }
});

// Dashboard Route
route.get('/dashboard', isAuthenticated, (req, res) => {
    const successMessage = req.flash('success');
    res.render('../views/users/dashboard', {
        success: successMessage,
        error: null,
        message: null,
        user:req.session.user 
    });
});

route.get('/deposit',isAuthenticated, (req, res)=>{
    console.log(`userId:${req.session.user.id}`);
    
    return res.status(200).render('../views/users/contribution', {
        success:null,
        error:null,
        user:req.session.user.id  
    })
})

// Contribution Page
route.post('/deposit',isAuthenticated, generateToken, async (req, res) => {
    const { amount, phone } = req.body;
    const userId = req.session.user?.id; 
    console.log(`UserId for deposit:${userId}`); 
    

    if (!amount || !phone) {
        return res.status(400).render('../views/users/contribution', {
            error: 'Please provide all the information',
            success: null,
            user: req.session.user,
        });
    }  

    if (amount <= 0) {
        return res.status(400).render('../views/users/contribution', {
            success: null,
            error: 'The amount is too low',
        });
    }
 

    try {

        console.log(`userId is:${userId}`);
 
        if (!userId) {
            return res.status(400).render('../views/users/contribution', {
                error: 'User session is not available. Please log in again.',
                success: null,
            });
        }
        

        // Generate MPesa STK push request
        const date = new Date();
        const Timestamp = date.getFullYear() +
            ("0" + (date.getMonth() + 1)).slice(-2) +
            ("0" + date.getDate()).slice(-2) +
            ("0" + date.getHours()).slice(-2) +
            ("0" + date.getMinutes()).slice(-2) +
            ("0" + date.getSeconds()).slice(-2);

        const shortcode = process.env.SHORT_CODE;
        const passKey = process.env.API_PASS_KEY;  
        const password = Buffer.from(shortcode + passKey + Timestamp).toString('base64');
        const token = req.token;

        const callback = `${process.env.BASE_URL}/contribution/mpesa/callback`; // Use environment variable for BASE_URL

        await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
                BusinessShortCode: shortcode,
                Password: password,
                Timestamp: Timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: amount,
                PartyA: `254${phone.substring(1)}`,
                PartyB: shortcode,
                PhoneNumber: `254${phone.substring(1)}`,
                CallBackURL: `${callback}?userId=${userId}`,
                AccountReference: `254${phone.substring(1)}`,
                TransactionDesc: "Contribution",
            },
            { 
                headers: { Authorization: `Bearer ${token}` }, 
            }
        ); 
 
        return res.status(200).render('../views/users/contribution', {
            success: 'STK push sent to your phone. Please complete the transaction.',
            error: null,
        }); 

    } catch (error) {
        console.error(`Error processing STK push: ${error.message}`);
        res.status(500).render('../views/users/contribution', {
            error: `Failed to send STK push: ${error.message}`,
            success: null,
        });
    }
});


route.post('/mpesa/callback', async (req, res) => {
    console.log("MPesa Callback Received:", JSON.stringify(req.body, null, 2));

    try {
        const payload = req.body;

        if (payload.Body && payload.Body.stkCallback) {
            const { stkCallback } = payload.Body;
            const resultCode = stkCallback.ResultCode;
            const resultDesc = stkCallback.ResultDesc;

            console.log(`ResultCode: ${resultCode}, ResultDesc: ${resultDesc}`);

            if (resultCode === 0) {
                const callbackData = stkCallback.CallbackMetadata?.Item || [];
                const amount = callbackData.find(item => item.Name === 'Amount')?.Value || 0;
                const phone = callbackData.find(item => item.Name === 'PhoneNumber')?.Value || null;
                const userId = req.query.userId;

                if (!userId) {
                    console.error('Missing userId in callback query');
                    return res.status(400).send('Invalid callback data');
                }

                const user = await User.findById(userId);
                if (!user) {
                    console.error('User not found');
                    return res.status(404).send('User not found');
                }

                user.currentContribution += amount;
                user.balance = Math.max(user.target - user.currentContribution, 0);
                await user.save();

                const contribution = new Contribution({ userId, amount });
                await contribution.save();

                console.log('Transaction recorded successfully');
            } else {
                console.warn(`Transaction failed or canceled: ${resultDesc}`);
            }

            return res.status(200).send('OK'); // Acknowledge Safaricom callback
        }

        console.error('Invalid payload structure:', payload);
        res.status(400).send('Invalid callback data');
    } catch (error) {
        console.error(`Error in MPesa callback: ${error.message}`);
        res.status(500).send('Internal server error');
    }
});




// Logout Route
route.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).render('../views/users/contribution',{
         success: true, message: 'Logged out successfully' 
        });
});

module.exports = route;  
