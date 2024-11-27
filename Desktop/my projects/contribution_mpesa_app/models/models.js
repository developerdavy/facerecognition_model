const { mongoose } = require('mongoose')
const env = require('dotenv')


const uri = 'mongodb+srv://david:david1803@contributions.97ntx.mongodb.net/?retryWrites=true&w=majority&appName=contributions'



const connectDB = async ()=>{
    try {
        
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 60000, // Adjust timeout as needed
        }) 

        console.log("connected to the database"); 
        

    } catch (error) 
     { 
        console.log("Error connecting to the database", error.message); 
        
    }
}
module.exports = connectDB()