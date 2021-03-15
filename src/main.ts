// 1. Import data
// 2. Each line of text file will be an element of an array
// 3. Decode base-64 encoding for each array element
// 4. Loop through and call 9 of the spam filters
// 5. Each spam filter function should write to the CSV with its result

const fs = require('fs');

/**
 * Import data from test-text.txt and convert each string from base64 encoding to UTF8.
 * @returns An array of spam text.
 */
function importData(): string[] {
    const testArray = fs.readFileSync('./data/test-text.txt').toString().split('\n');
    testArray.map((testCase: string) => {
        return Buffer.from(testCase, 'base64').toString('utf8');
    })
    console.log('hu');
    return testArray;
}

// TODO: Implement https://www.npmjs.com/package/spam-filter
// This spam filter lets you choose between using naive Bayes classifier or Fisher's method.

// TODO: Implement: https://www.npmjs.com/package/spam-check
// A simple node module for checking for spam in user inputs

// TODO: Implement: https://www.npmjs.com/package/akismet-api
// Full Nodejs bindings to the Akismet (https://akismet.com) spam detection service.

// TODO: Implement: https://www.npmjs.com/package/spam_detecter
// Small package based on Naive Bayes classifier to classify messages as spam or ham.

// TODO: Implement: https://www.npmjs.com/package/spamc
// spamc is a nodejs module that connects to spamassassin's spamd daemon using the spamc interface.

// TODO: Implement: https://www.npmjs.com/package/bad-words
// A javascript filter for badwords 

// TODO: Implement: https://www.npmjs.com/package/leo-profanity
// Profanity filter, based on "Shutterstock" dictionary

// TODO: Implement: https://npm.io/package/retext-profanities
// retext plugin to check for profane and vulgar wording. Uses cuss for sureness.

// TODO: Implement: https://npm.io/package/swearjar
// Profanity detection and filtering library.

// TODO: Implement: https://npm.io/package/censor-sensor
// A better profanity filter.

// TODO: Implement: https://npm.io/package/google-profanity-words
// Full List of Bad Words and Top Swear Words Banned by Google. As they closed the api (will most likely be used in conjuntion with other spam filters)

// TODO: Implement: https://npm.io/package/noswearing
// An advanced profanity filter based on English phonetics (how stuff sounds).

// TODO: Implement: https://npm.io/package/profanease
// A lightweight javascript detector and filter for profanity words / bad words written in typescript

/**
 * The main function.
 */
function main() {
    importData();
}

main();