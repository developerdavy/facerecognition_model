const express = require('express')
const axios = require('axios')
const env = require('dotenv').config()


const consumerKey = process.env.API_CONSUMER_KEY
const consumersecret = process.env.API_CONSUMER_SECRET

console.log({
    consumerKey,
    consumersecret
});

const auth = Buffer.from(`${consumerKey}:${consumersecret}`).toString('base64')

const generateToken = async(req, res, next) =>{

    try {
        
        const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {

            headers:{
                Authorization:`Basic ${auth}`
            }
        })

        const token = response.data.access_token
        console.log(token);

        req.token = token

        next()
        

    } catch (err) {
        
        if (err.response) {
            // Response was received but with an error status code
            console.error('Error response from API:', err.response.data);
            res.status(err.response.status).json({ message: err.response.data });
          } else if (err.request) {
            // No response was received
            console.error('No response received:', err.request);
            res.status(500).json({ message: 'No response from Safaricom API' });
          } else {
            // Some other error occurred during setup
            console.error('Request setup error:', err.message);
            res.status(500).json({ message: err.message });
          }
        
    }
}

module.exports = generateToken
