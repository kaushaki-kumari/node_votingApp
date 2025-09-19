const mongoose = require('mongoose');
require('dotenv').config();

const mongoURL = process.env.MONGODB_URL_LOCAL // for local connection 
// const mongoURL = process.env.MONGODB_URL

mongoose.connect(mongoURL)

const db = mongoose.connection;

db.on('connected', () => {
    console.log('connected to MongoDB sever');
})

db.on('error', (err)=>{
    console.error('MongoDb connection error', err)
})

db.on('disconnected', ()=>{
    console.log('MongoDB disconnected')
})

module.exports = db ;