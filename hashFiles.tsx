const fs = require('fs');
const path = require('path');

export function loadFilesFromDirectory(directory) {
    const contentsMap = new Map();

    function recursiveLoad(currentPath) {
        //console.log(currentPath);
        try{
            if (fs.statSync(currentPath).isDirectory()) {
                fs.readdirSync(currentPath).forEach(child => {
                    recursiveLoad(path.join(currentPath, child));
                });
            } else {
                const relativePath = path.relative(directory, currentPath).replace(path.sep, '/');
                contentsMap.set(relativePath, fs.readFileSync(currentPath, 'utf8'));
            }
        }catch{}
        
    }

    recursiveLoad(directory);
    return contentsMap;
}