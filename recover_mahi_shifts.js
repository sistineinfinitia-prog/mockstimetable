const fs = require('fs');
const path = require('path');
const os = require('os');

// Search paths for local storage LevelDB/SQLite directories
const searchPaths = [];

if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA;
    const appData = process.env.APPDATA;
    
    // Chrome Default
    searchPaths.push(path.join(localAppData, 'Google/Chrome/User Data/Default/Local Storage/leveldb'));
    // Chrome Profiles
    for (let i = 1; i <= 10; i++) {
        searchPaths.push(path.join(localAppData, `Google/Chrome/User Data/Profile ${i}/Local Storage/leveldb`));
    }
    // Edge Default
    searchPaths.push(path.join(localAppData, 'Microsoft/Edge/User Data/Default/Local Storage/leveldb'));
    // Edge Profiles
    for (let i = 1; i <= 10; i++) {
        searchPaths.push(path.join(localAppData, `Microsoft/Edge/User Data/Profile ${i}/Local Storage/leveldb`));
    }
} else if (process.platform === 'darwin') {
    const home = os.homedir();
    // Chrome Default on Mac
    searchPaths.push(path.join(home, 'Library/Application Support/Google/Chrome/Default/Local Storage/leveldb'));
    // Chrome Profiles on Mac
    for (let i = 1; i <= 10; i++) {
        searchPaths.push(path.join(home, `Library/Application Support/Google/Chrome/Profile ${i}/Local Storage/leveldb`));
    }
    // Edge Default on Mac
    searchPaths.push(path.join(home, 'Library/Application Support/Microsoft Edge/Default/Local Storage/leveldb'));
    // Edge Profiles on Mac
    for (let i = 1; i <= 10; i++) {
        searchPaths.push(path.join(home, `Library/Application Support/Microsoft Edge/Profile ${i}/Local Storage/leveldb`));
    }
    // Safari search paths on Mac
    searchPaths.push(path.join(home, 'Library/Safari/LocalStorage'));
    searchPaths.push(path.join(home, 'Library/Containers/com.apple.Safari/Data/Library/Safari/LocalStorage'));
    searchPaths.push(path.join(home, 'Library/WebKit/WebsiteData/LocalStorage'));
    searchPaths.push(path.join(home, 'Library/Containers/com.apple.Safari/Data/Library/WebKit/WebsiteData/LocalStorage'));
    searchPaths.push(path.join(home, 'Library/Containers/com.apple.Safari/Data/Library/WebKit/WebsiteData/Default/LocalStorage'));
}

console.log("=== LEVELDB & SQLITE SHIFTS RECOVERY TOOL ===");
console.log("Searching Chrome, Edge, and Safari local storage files for Mahi's shifts (GF_shifts)...");

let foundAny = false;

// We search for both UTF-8 and UTF-16LE formats since Safari stores local storage data as UTF-16LE in SQLite
const targetKeys = [
    { key: 'GF_shifts', buf: Buffer.from('GF_shifts', 'utf8'), isUtf16: false },
    { key: 'GF_shifts', buf: Buffer.from('GF_shifts', 'utf16le'), isUtf16: true },
    { key: 'GF_shifts_backup', buf: Buffer.from('GF_shifts_backup', 'utf8'), isUtf16: false },
    { key: 'GF_shifts_backup', buf: Buffer.from('GF_shifts_backup', 'utf16le'), isUtf16: true },
    { key: 'BF_shifts_backup', buf: Buffer.from('BF_shifts_backup', 'utf8'), isUtf16: false },
    { key: 'BF_shifts_backup', buf: Buffer.from('BF_shifts_backup', 'utf16le'), isUtf16: true }
];

function scanFile(filePath) {
    let buffer;
    try {
        buffer = fs.readFileSync(filePath);
    } catch (e) {
        return; // File locked or not readable
    }
    
    targetKeys.forEach(({ key, buf, isUtf16 }) => {
        let index = 0;
        while ((index = buffer.indexOf(buf, index)) !== -1) {
            // Read up to 10000 bytes ahead to capture the JSON string
            const startSearch = index;
            const endSearch = Math.min(buffer.length, index + 10000);
            const chunkBuffer = buffer.subarray(startSearch, endSearch);
            
            let chunk;
            if (isUtf16) {
                // Convert UTF-16LE buffer to standard UTF-8 string
                chunk = chunkBuffer.toString('utf16le');
            } else {
                chunk = chunkBuffer.toString('utf8');
            }
            
            // Search the string for JSON array matching study shifts
            const matches = chunk.match(/\[\s*\{\s*"subject"\s*:\s*".*?"\s*,\s*"date"\s*:\s*".*?"\s*,\s*"duration"\s*:\s*\d+.*\}\s*\]/g) ||
                            chunk.match(/\[\s*\{\s*"date"\s*:\s*".*?"\s*,\s*"duration"\s*:\s*\d+.*\}\s*\]/g);
                            
            if (matches) {
                matches.forEach(matchStr => {
                    try {
                        const parsed = JSON.parse(matchStr);
                        if (Array.isArray(parsed) && parsed.length > 0 && (parsed[0].duration !== undefined || parsed[0].subject !== undefined)) {
                            console.log(`\n🎉 SUCCESS! Found shifts data in ${filePath} near offset ${index} (${isUtf16 ? 'UTF-16LE' : 'UTF-8'}):`);
                            console.log(JSON.stringify(parsed, null, 2));
                            console.log("--------------------------------------------------------------------------------");
                            foundAny = true;
                        }
                    } catch (e) {
                        // Not valid JSON, try cleaner regex extract
                        const cleanMatch = extractBalancedArray(matchStr);
                        if (cleanMatch) {
                            try {
                                const parsedClean = JSON.parse(cleanMatch);
                                console.log(`\n🎉 SUCCESS (recovered JSON) in ${filePath} near offset ${index} (${isUtf16 ? 'UTF-16LE' : 'UTF-8'}):`);
                                console.log(JSON.stringify(parsedClean, null, 2));
                                console.log("--------------------------------------------------------------------------------");
                                foundAny = true;
                            } catch (err) {}
                        }
                    }
                });
            }
            
            // General extraction fallback: search for balanced bracket starting with [
            const bracketIndex = chunk.indexOf('[');
            if (bracketIndex !== -1) {
                const potentialJson = extractBalancedArray(chunk.substring(bracketIndex));
                if (potentialJson && (potentialJson.includes('"duration"') || potentialJson.includes('"subject"'))) {
                    try {
                        const parsed = JSON.parse(potentialJson);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            console.log(`\n🎉 SUCCESS (balanced array scan) in ${filePath} (${isUtf16 ? 'UTF-16LE' : 'UTF-8'}):`);
                            console.log(JSON.stringify(parsed, null, 2));
                            console.log("--------------------------------------------------------------------------------");
                            foundAny = true;
                        }
                    } catch (e) {}
                }
            }
            
            index += buf.length;
        }
    });
}

function extractBalancedArray(str) {
    let depth = 0;
    let start = -1;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '[') {
            if (depth === 0) start = i;
            depth++;
        } else if (str[i] === ']') {
            depth--;
            if (depth === 0 && start !== -1) {
                return str.substring(start, i + 1);
            }
        }
    }
    return null;
}

// Recursively find and scan files in search directories
function scanDirectoryRecursive(dir) {
    if (!fs.existsSync(dir)) return;
    let stat;
    try {
        stat = fs.statSync(dir);
    } catch (e) {
        return;
    }
    if (stat.isDirectory()) {
        try {
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                scanDirectoryRecursive(path.join(dir, file));
            });
        } catch (e) {
            // Directory not readable
        }
    } else if (stat.isFile()) {
        const name = path.basename(dir);
        // Scan leveldb files (.ldb, .log) and SQLite files (.localstorage, .localstorage-wal)
        if (dir.endsWith('.ldb') || dir.endsWith('.log') || dir.endsWith('.localstorage') || dir.endsWith('.localstorage-wal')) {
            scanFile(dir);
        }
    }
}

// Execute scan
searchPaths.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`Scanning: ${dir}...`);
        scanDirectoryRecursive(dir);
    } else {
        console.log(`Directory does not exist or is inaccessible: ${dir}`);
    }
});

if (!foundAny) {
    console.log("\n❌ Could not find any shifts data in browser local storage files.");
    if (process.platform === 'darwin') {
        console.log("\nTIP: If Safari/Terminal does not have Full Disk Access, files under Library/Safari may be hidden.");
        console.log("To resolve this, go to: System Settings > Privacy & Security > Full Disk Access, and check 'Terminal'.");
        console.log("Then re-run this script in Terminal: node recover_mahi_shifts.js");
    }
} else {
    console.log("\nCopy the JSON above and paste it into your profile!");
}

