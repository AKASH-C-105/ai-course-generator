import { config } from "dotenv";
config({ path: ".env.local" });

const url = process.env.DATABASE_URL;
console.log("DATABASE_URL length:", url?.length);
if (url) {
    console.log("DATABASE_URL starts with:", url.substring(0, 15) + "...");
    // Check for quotes
    if (url.startsWith('"') || url.startsWith("'")) {
        console.log("WARNING: DATABASE_URL starts with a quote!");
    }
} else {
    console.log("DATABASE_URL is undefined");
}

import { neon } from '@neondatabase/serverless';
try {
    if (url) {
        const sql = neon(url);
        console.log("Neon client created. Testing connection...");
        sql`SELECT 1`.then(() => {
            console.log("Connection successful!");
        }).catch((err) => {
            console.error("Connection failed:", err);
        });
    }
} catch (e) {
    console.error("Error creating neon client:", e);
}
