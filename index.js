const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String
});

const Contact = mongoose.model("Contact", contactSchema);

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail", // You can change this to another email service
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS  // Your email password or app password
    }
});

app.post("/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Save the message to MongoDB
        const newContact = new Contact({ name, email, message });
        await newContact.save();

        // Send an email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: "your-email@example.com", // Replace with the recipient email
            subject: "New Contact Form Submission",
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                return res.status(500).json({ message: "Failed to send email" });
            }
            console.log("Email sent: " + info.response);
            res.json({ message: "Message sent successfully!" });
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
