require('dotenv').config({ path: '.env.local' });
console.log("DATABASE_URL is set:", !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
    console.log("DATABASE_URL length:", process.env.DATABASE_URL.length);
    console.log("Starts with:", process.env.DATABASE_URL.substring(0, 10));
} else {
    console.log("DATABASE_URL is MISSING");
}
