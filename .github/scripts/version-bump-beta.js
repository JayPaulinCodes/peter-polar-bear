const fs = require("fs");
const package = require("../../package.json");

const BETA_VERSION_REGEX = /(\d+\.\d+\.\d+-beta\d+$)/g;
const PACKAGE_FIELD_REGEX = /(\"version\": \".*\")/g;

console.log("[STARTUP]: Starting version bump script for beta version.");

// Check if the current version exists
const currentVersion = package?.version;
if (currentVersion === undefined)
    return console.log("[FAILED]: Couldn't bump package version because no package version was found.");

// Determine if the current version is a beta version
const isCurrentVersionBeta = currentVersion.match(BETA_VERSION_REGEX) !== null;

// Determine the current non-beta version (ie. the next release)
const currentBetalessVersion = isCurrentVersionBeta 
    ? currentVersion.slice(0, currentVersion.indexOf("-beta"))
    : currentVersion;

// Determine the next beta version number
const nextBetaNumber = isCurrentVersionBeta
    ? parseInt(currentVersion.slice(currentVersion.indexOf("-beta") + 5)) + 1
    : 0;

// Create the new version string without the beta suffix
const newBetalessVersion = !isCurrentVersionBeta
    ? `${currentBetalessVersion.slice(0, currentBetalessVersion.lastIndexOf(".") + 1)}${parseInt(currentBetalessVersion.slice(currentBetalessVersion.lastIndexOf(".") + 1)) + 1}`
    : currentBetalessVersion;

// Create the new version string
const newVersion = `${newBetalessVersion}-beta${nextBetaNumber}`;

try {
    console.log(`[PROCESSING]: Trying to bump package version from ${currentVersion} to ${newVersion}`);

    // Read the package file
    const packageFileContent = fs.readFileSync("./package.json", { encoding: "utf8" });

    // Replace the version field
    const updatedPackageFileContent = packageFileContent.replace(PACKAGE_FIELD_REGEX, `"version": "${newVersion}"`);

    // Rewrite the package file with the new contents
    fs.writeFileSync("./package.json", updatedPackageFileContent);
    console.log("[SUCCESS]: Successfully bumped the package version");
} catch (err) {
    console.log(`[FAILED]: Failed bump the package version, encountered the following error, ${err.stack}`);
}