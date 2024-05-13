const AdmZip = require("./vendors/adm-zip");
const package = require("../../package.json");

const PACKAGE_FIELD_REGEX = /(\"version\": \".*\")/g;
const CONTENT_TYPE = { FILE: 0, FOLDER: 1 }

// Check if the current version exists
const currentVersion = package?.version;
if (currentVersion === undefined)
    return console.log("[FAILED]: Couldn't pack the artifact because no package version was found.");

// Check if the current project name exists
const currentName = package?.name;
if (currentVersion === undefined)
    return console.log("[FAILED]: Couldn't pack the artifact because no package name was found.");

// Create the archive name
const outputArchiveName = `${currentName.replace(" ", "-")}-artifact.zip`;

// Archive content
const archiveContent = [
    [ "./package-lock.json", CONTENT_TYPE.FILE ],
    [ "./package.json", CONTENT_TYPE.FILE ],
    [ "./assets", CONTENT_TYPE.FOLDER ],
    [ "./dist", CONTENT_TYPE.FOLDER ],
    [ "./ptero", CONTENT_TYPE.FOLDER ],
]

// Process the archive content
try {
    const ZIP = new AdmZip();
    
    archiveContent.forEach(elem => {
        if (elem[1] === CONTENT_TYPE.FILE) {
            ZIP.addLocalFile(elem[0], elem[0]);
        } else if (elem[1] === CONTENT_TYPE.FOLDER) {
            ZIP.addLocalFolder(elem[0], elem[0]);
        }
    });
    
    ZIP.writeZip("./" + outputArchiveName);
} catch (err) {
    return console.log("[FAILED]: Couldn't pack the artifact because an error was encountered: " + err.stack);
}