const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.id).select('-password');
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Verificar se usuário já existe
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        return done(null, user);
      }

      // Verificar se email já está cadastrado
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Vincular conta Google ao usuário existente
        user.googleId = profile.id;
        await user.save();
        return done(null, user);
      }

      // Criar novo usuário
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0]?.value,
        isEmailVerified: true
      });

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }));
}

module.exports = passport;
