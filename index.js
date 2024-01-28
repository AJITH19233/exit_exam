const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const cors=require('cors');

const app = express();
const PORT = 5000;
const allowedOrigins = ['http://localhost:3000'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

const MONGO_URL = "mongodb+srv://ajith1323:Achanamma@cluster0.3jql3om.mongodb.net/dbotp?retryWrites=true&w=majority";

// Connect to MongoDB
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error(`Error connecting to MongoDB at ${MONGO_URL}:`, err);
    process.exit(1);
  });

// OTP schema
const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
});
const OTP = mongoose.model('OTP', otpSchema);

// Middleware
app.use(bodyParser.json());

//Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'a34827395@gmail.com', // Your email address
    pass: 'ssrp icrz pejz bkhm', // Your password
  }
});

// generating otp when the email is entered
app.post('/submit-email', async (req, res) => {
  try {
    const { email } = req.body;
    // Generate OTP
    const otp = crypto.randomBytes(3).toString('hex');
    // Save OTP to database
    await OTP.create({ email, otp });

    // Send OTP to email
    const mailOptions = {
      from: 'ajithchandran132@gmail.com',
      to: email,
      subject: 'OTP for verification',
      text: `Your OTP is: ${otp}`
    };
    await transporter.sendMail(mailOptions);

    res.status(200).send({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error submitting email:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Route to verify OTP
app.post('/verify-otp', async (req, res) => {
    try {
      const { email, otp } = req.body;
      console.log('Verifying OTP for email:', email, 'OTP:', otp);
  
      const otpRecord = await OTP.findOne({ email, otp });
      console.log('OTP record:', otpRecord);
  
      if (otpRecord) {
        console.log('OTP matched successfully.');
        res.status(200).send({ matched: true });
      } else {
        console.log('OTP verification failed.');
        res.status(200).send({ matched: false });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).send({ error: 'Internal server error' });
    }
  });
  

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
