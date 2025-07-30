namespace NodeJS{
    interface ProcessEnv {
        // Application
        PORT: number
        HOST: string
        ENVIRONMENT: string

        // Google Auth
        GOOGLE_CLIENT_ID: string
        GOOGLE_CLIENT_SECRET: string

        // SMS
        SMS_URL: string
        SMS_API_KEY: string

        // Database
        DB_PORT: number,
        DB_HOST: string,
        DB_NAME: string,
        DB_USERNAME: string,
        DB_PASSWORD: string

        // Secrets
        SECRET_COOKIE_PARSER: string
        SECRET_JWT: string
        ACCESS_TOKEN_SECRET: string
        REFRESH_TOKEN_SECRET: string

    }
}