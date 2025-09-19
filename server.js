const express = require('express')
const app = express();
const db = require('./db');

require('dotenv').config();
const PORT = process.env.PORT || 3000;
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url);
  next();
});
app.use(express.json());


app.use(express.urlencoded({ extended: true }));

const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

app.use('/user',userRoutes)
app.use('/candidate',candidateRoutes)

app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
})