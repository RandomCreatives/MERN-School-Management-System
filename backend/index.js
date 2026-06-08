const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { helmet, apiLimiter, sanitizeInput } = require("./middleware/security");
const supabase = require("./supabaseClient");

dotenv.config();

const app = express();
const Routes = require("./routes/route.js");
const EnhancedRoutes = require("./routes/enhanced-routes.js");

const PORT = process.env.PORT || 5001;

// Security Middleware
app.use(helmet());

// CORS Configuration
const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.some(allowed => origin.includes(allowed))) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all for now
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Input Sanitization
app.use(sanitizeInput);

// Rate Limiting
app.use('/api/', apiLimiter);

// Verify Supabase connection on startup
async function verifySupabaseConnection() {
    try {
        const { error } = await supabase.from('admins').select('id').limit(1);
        if (error && error.code !== 'PGRST116') {
            console.warn('⚠️  Supabase query warning:', error.message);
        } else {
            console.log('✅ Connected to Supabase - BIS NOC School System');
        }
    } catch (err) {
        console.error('❌ Supabase connection error:', err.message);
    }
}

verifySupabaseConnection();

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'BIS NOC School Management System API',
        database: 'Supabase (PostgreSQL)',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/health',
            admin: '/AdminLogin, /AdminReg',
            students: '/Students/all, /StudentReg, /StudentLogin',
            teachers: '/AllTeachers, /TeacherReg, /TeacherLogin'
        }
    });
});

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'BIS NOC School Management System is running',
        database: 'Supabase',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/', Routes);
app.use('/api', EnhancedRoutes);

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

// Start server (local only — Vercel uses module.exports)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 BIS NOC School Server running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    });
}

module.exports = app;
