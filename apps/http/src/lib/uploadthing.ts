//here goes the FileRouter definition

import { createUploadthing, type FileRouter } from "uploadthing/server"; //using server, because hono is being used.
import { prisma } from "@sandboox/db";



//this is essentially a factory function that returns a "route builder"
const f = createUploadthing();

export const ourFileRouter: FileRouter = {

    //one can always go for blob
    //but something stricter is needed since we only need apk files.
    //using the exact apk MIME type is recommended

    apkUploader: f({
        blob: {
            maxFileSize: "64MB",
            maxFileCount: 1,
        }
    })
        .middleware(async ({ req }) => {
            // You can add authentication here later
            return { uploadedBy: "test-user" }
        })
        .onUploadError((err) => {
            console.log("Upload error: ", err.error.message);
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("APK Uploaded by:", metadata.uploadedBy);
            console.log("File URL: ", file.ufsUrl);
            return { url: file.ufsUrl };
        })


} satisfies FileRouter;




