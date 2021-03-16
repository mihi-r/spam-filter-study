// 1. Import data
// 2. Each line of text file will be an element of an array
// 3. Decode base-64 encoding for each array element
// 4. Loop through and call 9 of the spam filters
// 5. Each spam filter function should write to the CSV with its result

const fs = require('fs');
const spamc = require('spamc');
const badWords = require('bad-words');
const googleProfanityWords = require('google-profanity-words');
const leo = require('leo-profanity');
const vfile = require('to-vfile');
const report = require('vfile-reporter');
const unified = require('unified');
const english = require('retext-english');
const stringify = require('retext-stringify');
const profanities = require('retext-profanities');
const Profanease = require('profanease');
const noSwearing = require("noswearing");
const censorSensor = require('censor-sensor');
const swearjar = require('swearjar');
const csv = require('csv-parser');
const { Parser } = require('json2csv');
const spamcheck = require('spam-detection');

enum CsvColumnName {
    TestCase = "testCase",
    TestLength = "testLength",
    ExpectedOutput = "expectedOutput",
    SpamFilterRuntime = "spam-filter_runtime",
    SpamFilterOutput = "spam-filter_output",
    SpamCheckRuntime = "spam-check_runtime",
    SpamCheckOutput = "spam-check_output",
    AkismetApiRuntime = "akismet-api_runtime",
    AkismetApiOutput = "akismet-api_output",
    SpamDetectionRuntime = "spam_detection_runtime",
    SpamDetectionOutput = "spam_detection_output",
    SpamcRuntime = "spamc_runtime",
    SpamcOutput = "spamc_output",
    BadWordsRuntime = "bad-words_runtime",
    BadWordsOutput = "bad-words_output",
    LeoProfanitiesRuntime = "leo-profanities_runtime",
    LeoProfanitiesOutput = "leo-profanities_output",
    RetextProfanitiesRuntime = "retext-profanities_runtime",
    RetextProfanitiesOutput = "retext-profanities_output",
    SwearjarRuntime = "swearjar_runtime",
    SwearjarOutput = "swearjar_output",
    CensorSensorRuntime = "censor-sensor_runtime",
    CensorSensorOutput = "censor-sensor_output",
    NoswearingRuntime = "noswearing_runtime",
    NoswearingOutput = "noswearing_output",
    ProfaneaseRuntime = "profanease_runtime",
    ProfaneaseOutput = "profanease_output"
}

/**
 * Import data from test-text.txt and convert each string from base64 encoding to UTF8.
 * @returns An array of spam text.
 */
function importData(): string[] {
    const testArray = fs.readFileSync('./data/test-text.txt').toString().split('\n');
    const stringArray = testArray.map((testCase: string) => {
        return Buffer.from(testCase, 'base64').toString('utf8');
    });
    return stringArray;
}

/**
 * Add data to CSV.
 * @param columnName The column name to add the data to.
 * @param columnValues The data to add.
 */
function addToCsv(columnName: CsvColumnName, columnValues: string[]) {
    return new Promise<void>((resolve) => {
        const allData: string[] = [];
        fs.createReadStream('./data/result.csv')
            .pipe(csv())
            .on('data', function (data: any) {
                data[columnName] = columnValues[Number(data.testCase)];
                allData.push(data);
            })
            .on('end', function(){
                const parser = new Parser({ fields: Object.keys(allData[0]) });
                const newCsv = parser.parse(allData);
                fs.writeFileSync('./data/result.csv', newCsv);
                resolve();
            });
    })
}

// TODO: Implement https://www.npmjs.com/package/spam-filter
// This spam filter lets you choose between using naive Bayes classifier or Fisher's method.

// TODO: Implement: https://www.npmjs.com/package/spam-check
// A simple node module for checking for spam in user inputs


// TODO: Implement: https://www.npmjs.com/package/akismet-api
// Full Nodejs bindings to the Akismet (https://akismet.com) spam detection service.

/**
 * Implement: https://www.npmjs.com/package/spam-detection
 * Small package based on Naive Bayes classifier to classify messages as spam or ham.
 * @param data The data.
 */
async function runSpamDetection(data: string[]) {
    const results = data.map((value) => {
        return spamcheck.detect(value) === 'spam' ? 'spam' : 'valid';
    });
    await addToCsv(CsvColumnName.SpamDetectionOutput, results);
}


// TODO: Implement: https://www.npmjs.com/package/spamc
// spamc is a nodejs module that connects to spamassassin's spamd daemon using the spamc interface.

// function runSpamc(testArray: string[]): void{
//     const Spamc = new spamc();
//     // const results = testArray.map((testCase: string) => {
        
//     // });
//     Spamc.report(testArray[0], function (result: string[]) {
//         console.log(result)
//     })


// }

/**
 * Implement: https://www.npmjs.com/package/bad-words
 * A javascript filter for badwords
 * @param testArray The array of test cases to test the package
 */ 

async function runBadWords(testArray: string[]) {
    const bad_words = new badWords();
    const results = testArray.map((testCase: string) => {
        return (bad_words.isProfane(testCase)) ? 'spam' : 'valid';
    });

    await addToCsv(CsvColumnName.BadWordsOutput, results);
}

/**
 * Implement: https://www.npmjs.com/package/leo-profanity
 * Profanity filter, based on "Shutterstock" dictionary
 * @param testArray The array of test cases to test the package
 */ 

async function runLeoProfanity(testArray: string[]) {

    const results = testArray.map((testCase: string) => {
        return (leo.check(testCase)) ? 'spam' : 'valid';
    });

    await addToCsv(CsvColumnName.LeoProfanitiesOutput, results);
}

/**
 * Implement: https://npm.io/package/retext-profanities
 * retext plugin to check for profane and vulgar wording. Uses cuss for sureness.
 * @param testArray The array of test cases to test the package
 */ 

async function runRetextProfanities(testArray: string[]) {
    const results: string[] = [];
    testArray.forEach(testCase =>
        unified()
        .use(english)
        .use(profanities)
        .use(stringify)
        .process(testCase, function(err: string, output: string) {
            const warnings = new RegExp(/\bwarnings|warning\b/g);
            results.push((warnings.test(report(output))) ? 'spam' : 'valid');
        })
    );

    await addToCsv(CsvColumnName.RetextProfanitiesOutput, results);
    
}

/**
 * Profanity detection and filtering library.
 * @param stringArray is the array of test cases to be ran through the filter
 */
async function runSwearJar(stringArray: string[]) {
    const swearJarArray = stringArray.map((testCase: string) => {
        let result = swearjar.profane(testCase);

        if (result == true) {
            return "spam"
        }
        if (result == false) {
            return "valid"
        }

        console.log(result);
     });
    await addToCsv(CsvColumnName.SwearjarOutput, swearJarArray);
}

/**
 * A better profanity filter.
 * @param stringArray is the array of test cases to be ran through the filter
 */
 async function runCensorSensor(stringArray: string[]) {
    const censorSensorArray = stringArray.map((testCase: string) => {
        let result = censorSensor.isProfane(testCase)

        if (result == true) {
            return "spam"
        }
        if (result == false) {
            return "valid"
        }

        console.log(result);
     });
    await addToCsv(CsvColumnName.CensorSensorOutput, censorSensorArray);
}

/**
 * An advanced profanity filter based on English phonetics (how stuff sounds).
 * @param stringArray is the array of test cases to be ran through the filter
 */
 async function runNoSwearing(stringArray: string[]) {
    const noSwearingArray = stringArray.map((testCase: string) => {
        let result = noSwearing(testCase);

        if (result.length == 0) {
            return "valid"
        }
        if (result.length >= 1) {
            return "spam"
        }
      });
    await addToCsv(CsvColumnName.NoswearingOutput, noSwearingArray);
}

/**
 * A lightweight javascript detector and filter for profanity words / bad words written in typescript
 * @param stringArray is the array of test cases to be ran through the filter
 */
async function runProfanease(stringArray: string[]) {
    let isProfane = new Profanease({lang : 'all'});
    const profaneseArray = stringArray.map((testCase: string) => {
        if (isProfane.check(testCase) == true) {
            return "spam"
        }
        if (isProfane.check(testCase) == false) {
            return "valid"
        }
      });
    await addToCsv(CsvColumnName.ProfaneaseOutput, profaneseArray);
}


// TODO: Implement: https://npm.io/package/google-profanity-words
// Full List of Bad Words and Top Swear Words Banned by Google. As they closed the api (will most likely be used in conjuntion with other spam filters)

/**
 * The main function.
 */

async function main() {
    const data = importData();
    await runProfanease(data);
    await runNoSwearing(data);
    await runSwearJar(data);
    //await runCensorSensor(stringArray); doesnt work, idk why it doesnt recongize the function used for this package
    await runSpamDetection(data);
    await runBadWords(data);
    await runLeoProfanity(data);
    await runRetextProfanities(data);
}

main();