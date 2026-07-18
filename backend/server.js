const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require("path");
const dns = require('dns');
require('dotenv').config();

// Some hosting platforms (e.g. Render) fail to reach certain external
// services (like Gmail's SMTP server) over IPv6, even though IPv4 works
// fine. This forces Node's DNS resolver to prefer IPv4 addresses globally,
// for every outgoing connection this server makes — not just email.
dns.setDefaultResultOrder('ipv4first');

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const jobRoutes = require('./routes/jobRoutes');
app.use('/api/jobs', jobRoutes);
const applicationRoutes = require('./routes/applicationRoutes');
app.use('/api/applications', applicationRoutes);



app.get('/', (req, res) => {
  res.send('Job Portal Backend is running!');
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => console.log('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});