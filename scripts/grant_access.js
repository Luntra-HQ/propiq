
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = "https://mild-tern-361.convex.cloud";

const client = new ConvexHttpClient(CONVEX_URL);

async function main() {
    const email = "jeremybabb@gmail.com";
    console.log(`Granting access to ${email}...`);

    try {
        const result = await client.mutation(api.manual_admin.grantBetaAccess, { email });
        console.log("Result:", result);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();
