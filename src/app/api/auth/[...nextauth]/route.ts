import NextAuth, { AuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak"

declare module "next-auth" {
  interface Session {
    accessToken : string | undefined
    idToken? : string
    error?: "RefreshTokenError"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string | undefined
    idToken? : string
    refresh_token?: string
    expires_at? : number
    error?: "RefreshTokenError"
  }
}

export const authOptions: AuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KC_CLIENT_ID,
      clientSecret: process.env.KC_CLIENT_SECRET,
      issuer: process.env.KC_CLIENT_ISSUER
    })
  ],
  session: {
    maxAge: 60 * 30
  },
  pages : {
    signIn : '/auth/login'
  }
  ,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        // First-time login, save the `access_token`, its expiry and the `refresh_token`
        return {
          ...token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          refresh_token: account.refresh_token,
          idToken : account.id_token
        }
      } else if (Date.now() < (token.expires_at ?? 0) * 1000) {
        // Subsequent logins, but the `access_token` is still valid
        return token
      } else {
        console.log("Going to refresh token")
        // Subsequent logins, but the `access_token` has expired, try to refresh it
        if (!token.refresh_token) throw new TypeError("Missing refresh_token")
        try {
          // The `token_endpoint` can be found in the provider's documentation. Or if they support OIDC,
          // at their `/.well-known/openid-configuration` endpoint.
          // i.e. https://accounts.google.com/.well-known/openid-configuration
          const response = await fetch(process.env.KC_TOKEN_ENDPOINT, {
            method: "POST",
            body: new URLSearchParams({
              client_id: process.env.KC_CLIENT_ID!,
              client_secret: process.env.KC_CLIENT_SECRET!,
              grant_type: "refresh_token",
              refresh_token: token.refresh_token!,
            }),
          })
 
          const tokensOrError = await response.json()
 
          if (!response.ok) throw tokensOrError
 
          const newTokens = tokensOrError as {
            access_token: string
            expires_in: number
            refresh_token?: string
            id_token? : string
          }
         console.log("token refreshed")
          return {
            ...token,
            access_token: newTokens.access_token,
            expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
            // Some providers only issue refresh tokens once, so preserve if we did not get a new one
            refresh_token: newTokens.refresh_token
              ? newTokens.refresh_token
              : token.refresh_token,
            idToken : newTokens.id_token
          }
        } catch (error) {
          console.error("Error refreshing access_token", error)
          // If we fail to refresh the token, return an error so we can handle it on the page
          token.error = "RefreshTokenError"
          return token
        }
      }
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.error = token.error
      session.idToken = token.idToken
      return session
    }
  }
}
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }