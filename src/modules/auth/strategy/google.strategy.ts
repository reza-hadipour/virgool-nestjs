import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super({
        // Define the strategy name and options here
        // You can also specify other options like client ID, client secret, callback URL, etc.
        // These would typically be loaded from environment variables.
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `http://localhost:${process.env.PORT}/auth/google/redirect`, // Adjust this URL as needed
        scope: ['email', 'profile'], // Define the scopes you need
    })
    // This is a placeholder for the Google strategy implementation.
    // You would typically use a library like Passport.js to implement the Google OAuth strategy here.
  }

  // Example method to handle Google authentication
  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    // Logic to validate the user with the provided profile information
    // This could involve checking if the user exists in your database and creating a new user if not.
    const {emails, displayName} = profile;
    const [emailData] = emails;

    const user= {
        displayName,
        email: emailData.value,
        accessToken
    }
    
    done(null, user)

  }

}