import fs from "fs";
import path from "path";
import { parseStringPromise } from "xml2js";
//Set of dangerous permissions that the apk could have
const DANGEROUS_PERMISSIONS = new Set([
    "CAMERA",
    "READ_CONTACTS",
    "WRITE_CONTACTS",
    "GET_ACCOUNTS",
    "ACCESS_FINE_LOCATION",
    "ACCESS_COARSE_LOCATION",
    "ACCESS_BACKGROUND_LOCATION",
    "RECORD_AUDIO",
    "READ_PHONE_STATE",
    "READ_PHONE_NUMBERS",
    "CALL_PHONE",
    "READ_CALL_LOG",
    "WRITE_CALL_LOG",
    "ADD_VOICEMAIL",
    "USE_SIP",
    "SEND_SMS",
    "RECEIVE_SMS",
    "READ_SMS",
    "RECEIVE_WAP_PUSH",
    "RECEIVE_MMS",
    "READ_EXTERNAL_STORAGE",
    "WRITE_EXTERNAL_STORAGE",
    "READ_MEDIA_IMAGES",
    "READ_MEDIA_VIDEO",
    "READ_MEDIA_AUDIO",
    "BODY_SENSORS",
    "ACTIVITY_RECOGNITION",
    "READ_CALENDAR",
    "WRITE_CALENDAR",
    "POST_NOTIFICATIONS",
    "NEARBY_WIFI_DEVICES",
    "BLUETOOTH_CONNECT",
    "BLUETOOTH_SCAN",
    "BLUETOOTH_ADVERTISE",
]);
//Set of signature permissions that the apk could have
const SIGNATURE_PERMISSIONS = new Set([
    "INSTALL_PACKAGES",
    "DELETE_PACKAGES",
    "MANAGE_EXTERNAL_STORAGE",
    "SYSTEM_ALERT_WINDOW",
    "WRITE_SETTINGS",
    "REQUEST_INSTALL_PACKAGES",
    "CHANGE_WIFI_STATE",
    "BLUETOOTH_ADMIN",
    "NFC",
]);
//main function to parse the manifest
export async function parseManifest(decompDir) {
    //build the path inside apktool's output directory
    const manifestPath = path.join(decompDir, "apktool", "AndroidManifest.xml");
    //if not found return null for all values 
    if (!fs.existsSync(manifestPath)) {
        console.warn(`AndroidManifest.xml not found at ${manifestPath}`);
        return getDefaultManifest(); //return safe defaults if xml not found
    }
    //get the xml content
    const xml = fs.readFileSync(manifestPath, "utf-8");
    try {
        //convert xml to nested js object
        const parsed = await parseStringPromise(xml, {
            explicitArray: true, //meaning that every element is wrapped in an array (even if there's only one element)
            mergeAttrs: false, //means xml attrs are kept in .$ property
        });
        const manifest = parsed.manifest;
        if (!manifest) {
            return getDefaultManifest();
        }
        const attrs = manifest.$ || {}; //why .$?
        //this is how xml2js stores xml attrs
        // {
        //   manifest: {
        //     $: { <------------------xml attrs are stored in a special prop called $
        //       version: "1.0",
        //       package: "com.example.app"
        //     }
        //   }
        // }
        const app = manifest.application?.[0];
        const apkAttrs = app?.$ || {};
        const sdkInfo = manifest["uses-sdk"]?.[0]?.$ || {};
        const permissions = parsePermissions(manifest); //todo: make a permissions parser
        const exportedComponents = parsedExportedComponents(app); //todo: make a parser for exported comps
        return {
            packageName: attrs.package || null,
            versionName: attrs["android:versionName"] || null,
            versionCode: attrs["android:versionCode"] ? parseInt(attrs["android:versionCode"]) : null,
            minSdkVersion: sdkInfo["android:minSdkVersion"] ? parseInt(sdkInfo["android:minSdkVersion"]) : null,
            targetSdkVersion: sdkInfo["android:targetSdkVersion"] ? parseInt(sdkInfo["android:targetSdkVersion"]) : null,
            permissions,
            exportedComponents,
            debuggable: apkAttrs["android:debuggable"] === "true", //app can be debugged (big security risk in prod)
            allowBackup: apkAttrs["android:allowBackup"] !== "false", //defaults to true; allow ADB backup of app data
            usesCleartextTraffic: apkAttrs["android:usesCleartextTraffic"] === "true", //allows unencrypted http connections
            networkSecurityConfig: !!apkAttrs["android:networkSecurityConfig"], //checks if a custom network security exists
        };
    }
    catch (error) {
        console.error("Failed to parse AndroidManifest.xml:  ", error);
        return getDefaultManifest();
    }
}
//func to parse permissions
function parsePermissions(manifest) {
    //iterate over uses-permission tags
    //extract full Android permission name 
    //then classify risk
    const usesPerms = manifest["uses-permission"] || [];
    return usesPerms.map((p) => {
        const fullName = p.$?.["android:name"] || "unknown";
        const shortName = fullName.split(".").pop() || "unknown";
        return {
            name: fullName,
            shortName,
            risk: classifyPermission(shortName)
        };
    });
}
//func to classify permissions
function classifyPermission(shortName) {
    const upper = shortName.toUpperCase();
    //simple lookup against two sets
    if (DANGEROUS_PERMISSIONS.has(upper))
        return "dangerous";
    if (SIGNATURE_PERMISSIONS.has(upper))
        return "signature";
    return "normal";
}
//func to parse exported components
function parsedExportedComponents(app) {
    if (!app)
        return [];
    const components = [];
    const types = [
        { key: "activity", type: "activity" },
        { key: "service", type: "service" },
        { key: "receiver", type: "receiver" },
        { key: "provider", type: "provider" },
    ];
    for (const { key, type } of types) {
        const items = app[key] || [];
        for (const item of items) {
            const attrs = item.$ || {};
            const hasIntentFilter = (item["intent-filter"] || []).length > 0;
            //exported if explicitly set or has an intent-filter (implicit export)
            const isExported = attrs["android:exported"] === "true" || hasIntentFilter;
            if (isExported) {
                components.push({
                    name: attrs["android:name"] || "unknown",
                    type,
                    intentFilters: (item["intent-filter"] || []).length
                });
            }
        }
    }
    return components;
}
function getDefaultManifest() {
    return {
        packageName: null,
        versionName: null,
        versionCode: null,
        minSdkVersion: null,
        targetSdkVersion: null,
        permissions: [],
        exportedComponents: [],
        debuggable: false,
        allowBackup: true,
        usesCleartextTraffic: false,
        networkSecurityConfig: false,
    };
}
//# sourceMappingURL=manifest.js.map