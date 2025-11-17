const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { helmet, apiLimiter, sanitizeInput } = require("./middleware/security");

dotenv.config();

const app = express();
const Routes = require("./routes/route.js");
const EnhancedRoutes = require("./routes/enhanced-routes.js");

const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());

// CORS Configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Input Sanitization
app.use(sanitizeInput);

// Rate Limiting
app.use('/api/', apiLimiter);

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("✅ Connected to MongoDB - BIS NOC School System");
    })
    .catch((err) => {
        console.log("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });

// Routes
app.use('/', Routes);
app.use('/api', EnhancedRoutes); // New enhanced API routes

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'BIS NOC School Management System is running',
        timestamp: new Date().toISOString()
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

app.listen(PORT, () => {
    console.log(`🚀 BIS NOC School Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});