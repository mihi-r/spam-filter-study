// 1. Import data
// 2. Each line of text file will be an element of an array
// 3. Decode base-64 encoding for each array element
// 4. Loop through and call 9 of the spam filters
// 5. Each spam filter function should write to the CSV with its result

const fs = require('fs');

function importData(): string[] {
    const testArray = fs.readFileSync('./data/test-text.txt').toString().split('\n');
    testArray.map((testCase: string) => {
        return Buffer.from(testCase, 'base64').toString('utf8');
    })
    return testArray;
}

function main() {
    importData();
}

main();