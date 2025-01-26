import express from 'express';
import cors from 'cors';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import session from 'express-session';
import accountRoutes from './routes/accountRoutes';
import bigQueryRoutes from './routes/bigQueryRoutes';
import invitationRoutes from './routes/invitationRoutes';

// Extend Express types to include user
declare global {
  namespace Express {
    interface User extends Profile {}
  }
}

const app = express();

// Configure CORS with specific options
app.use(cors({
  origin: 'https://growth-manager-1-frontend.onrender.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: 'https://growth-manager-1.onrender.com/auth/google/callback'
  },
  async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
    try {
      // Here you would typically:
      // 1. Check if the user exists in your database
      // 2. If not, create a new user
      // 3. Return the user object
      return done(null, profile);
    } catch (error) {
      return done(error as Error);
    }
  }
));

passport.serializeUser((user: Express.User, done: (err: any, id?: unknown) => void) => {
  done(null, user);
});

passport.deserializeUser((user: unknown, done: (err: any, user?: Express.User | false | null) => void) => {
  done(null, user as Express.User);
});

// Google OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: 'https://growth-manager-1-frontend.onrender.com/login' 
  }),
  (req, res) => {
    // Successful authentication, redirect to dashboard
    res.redirect('https://growth-manager-1-frontend.onrender.com/dashboard');
  }
);

// Add a root test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.use('/api/accounts', accountRoutes);
app.use('/api/bigquery', bigQueryRoutes);
app.use('/api/invitations', invitationRoutes);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 