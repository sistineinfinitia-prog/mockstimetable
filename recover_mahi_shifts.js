const fs = require('fs');
const path = require('path');
const os = require('os');

// Search paths for local storage LevelDB directories
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
}

console.log("=== LEVELDB SHIFTS RECOVERY TOOL ===");
console.log("Searching Chrome and Edge LevelDB files for Mahi's shifts (GF_shifts)...");

let foundAny = false;

function scanFile(filePath) {
    let buffer;
    try {
        buffer = fs.readFileSync(filePath);
    } catch (e) {
        return; // File locked or not readable
    }
    
    // Search for "GF_shifts"
    let index = 0;
    const targetKey = Buffer.from('GF_shifts');
    
    while ((index = buffer.indexOf(targetKey, index)) !== -1) {
        // Search ahead in the file for a JSON array of shifts
        // Shifts usually look like: [{"subject":"econ","date":"2026-...","duration":60}]
        const startSearch = index;
        const endSearch = Math.min(buffer.length, index + 5000);
        
        const chunk = buffer.subarray(startSearch, endSearch).toString('utf8');
        
        // Find arrays starting with [ and containing subject/duration
        const matches = chunk.match(/\[\s*\{\s*"subject"\s*:\s*".*?"\s*,\s*"date"\s*:\s*".*?"\s*,\s*"duration"\s*:\s*\d+.*\}\s*\]/g) ||
                        chunk.match(/\[\s*\{\s*"date"\s*:\s*".*?"\s*,\s*"duration"\s*:\s*\d+.*\}\s*\]/g);
                        
        if (matches) {
            matches.forEach(matchStr => {
                try {
                    // Try parsing to validate it is correct JSON
                    const parsed = JSON.parse(matchStr);
                    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].duration !== undefined) {
                        console.log(`\n🎉 SUCCESS! Found shifts data in ${path.basename(filePath)} near offset ${index}:`);
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
                            console.log(`\n🎉 SUCCESS (recovered JSON) in ${path.basename(filePath)} near offset ${index}:`);
                            console.log(JSON.stringify(parsedClean, null, 2));
                            console.log("--------------------------------------------------------------------------------");
                            foundAny = true;
                        } catch (err) {}
                    }
                }
            });
        }
        
        // General extraction fallback: search for balanced bracket starting with [ and containing "subject" and "duration"
        const bracketIndex = chunk.indexOf('[');
        if (bracketIndex !== -1) {
            const potentialJson = extractBalancedArray(chunk.substring(bracketIndex));
            if (potentialJson && (potentialJson.includes('"duration"') || potentialJson.includes('"subject"'))) {
                try {
                    const parsed = JSON.parse(potentialJson);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        console.log(`\n🎉 SUCCESS (balanced array scan) in ${path.basename(filePath)}:`);
                        console.log(JSON.stringify(parsed, null, 2));
                        console.log("--------------------------------------------------------------------------------");
                        foundAny = true;
                    }
                } catch (e) {}
            }
        }
        
        index += targetKey.length;
    }
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

// Execute scan
searchPaths.forEach(dir => {
    if (fs.existsSync(dir)) {
        try {
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                if (file.endsWith('.ldb') || file.endsWith('.log')) {
                    scanFile(path.join(dir, file));
                }
            });
        } catch (e) {
            // Directory read error
        }
    }
});

if (!foundAny) {
    console.log("\n❌ Could not find any shifts data in Chrome or Edge LevelDB files.");
    console.log("Mahi should run this script on her own computer/browser context where she logged her study hours.");
} else {
    console.log("\nCopy the JSON above and paste it into your profile!");
}
