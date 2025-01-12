export const authConfig = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: 'http://localhost:3001/auth/google/callback'
  },
  session: {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false
  }
}; 