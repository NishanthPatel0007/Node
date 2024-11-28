const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Backblaze B2 credentials
const B2_ACCOUNT_ID = "0035d54cb95a5ae0000000002"; // Replace with your B2 Account ID
const B2_APP_KEY = "K003eQ+nQIB1tdj4s76tHaGJluvagq";       // Replace with your B2 Application Key
const B2_BUCKET_NAME = "TenCrore"; // Replace with your B2 Bucket Name

// Generate a signed URL for a video file
app.post("/generate-url", async (req, res) => {
    const { fileName } = req.body; // The video file name from your request

    try {
        // Step 1: Authenticate with Backblaze
        const authResponse = await axios.get(
            "https://api.backblazeb2.com/b2api/v2/b2_authorize_account", 
            {
                auth: {
                    username: B2_ACCOUNT_ID,
                    password: B2_APP_KEY,
                },
            }
        );

        const { apiUrl, authorizationToken } = authResponse.data;

        // Step 2: Get the download URL
        const fileUrl = `${apiUrl}/file/${B2_BUCKET_NAME}/${fileName}`;

        // Step 3: Generate a signed URL
        const expiration = Math.floor(Date.now() / 1000) + 3600; // 1-hour expiration
        const signedUrl = `${fileUrl}?Authorization=${authorizationToken}&Expires=${expiration}`;

        res.json({ signedUrl });
    } catch (error) {
        console.error("Error generating signed URL:", error);
        res.status(500).send("Failed to generate signed URL.");
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
