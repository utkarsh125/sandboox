import { UTApi } from "uploadthing/server";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ut_api = new UTApi({
    token: process.env.UPLOADTHING_TOKEN!,
});

async function runTest() {
    // Relative to this file (src/), it's 2 levels up to sandboox root
    const apkPath = path.resolve(__dirname, "../../../test.apk");

    if (!fs.existsSync(apkPath)) {

        console.error("APK NOT FOUND AT: " + apkPath);
        return;
    }

    console.log("STARTING Upload for: " + apkPath);

    try {


        const fileBuffer = fs.readFileSync(apkPath);

        const file = new File([fileBuffer], "test.apk", {
            type: "application/octet-stream"
        });

        const response = await ut_api.uploadFiles([file]);
        const result = response[0];

        if (result.error) {
            console.error("UPLOAD FAILED: ", result.error);
        }

        else {
            console.log("UPLOAD SUCCESS: ", result.data.ufsUrl);
        }
    } catch (error) {
        console.error("ERROR UNEXPECTED: ", error);
    }
}


runTest();

