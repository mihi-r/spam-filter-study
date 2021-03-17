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
const filter = require('spam-filter')();
const spamCheck = require('spam-check');
const Filter = require("badwords-filter");


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
    ProfaneaseOutput = "profanease_output",
    BadWordsFilterOutput = "badwords-filter_output",
    BadWordsFilterRuntime = "badwords-filter_runtime"
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

/**
 * Implement https://www.npmjs.com/package/spam-filter
 * This spam filter lets you choose between using naive Bayes classifier or Fisher's method.
 * @param data The data.
 * @returns Array of valid or spam results for each test case.
 */
function runSpamFilter(data: string[]) {
    const results = data.map((testCase) => {
        return filter.isSpam(testCase) ? 'spam' : 'valid';
    });

    return results;
}

/**
 * Implement: https://www.npmjs.com/package/spam-check
// A simple node module for checking for spam in user inputs
 * @param data The data.
 * @returns Array of valid or spam results for each test case.
 */
function runSpamCheck(data: string[]) {
    const results = data.map((testCase) => {
        let result: string = '';

        spamCheck({ 'string':testCase }, function(_err: any, checkResult: { spam: boolean }) {
            result = checkResult.spam ? 'spam' : 'valid';
        });
        return result;
    });

    return results;
}

// TODO: Implement: https://www.npmjs.com/package/akismet-api
// Full Nodejs bindings to the Akismet (https://akismet.com) spam detection service.

/**
 * Implement: https://www.npmjs.com/package/spam-detection
 * Small package based on Naive Bayes classifier to classify messages as spam or ham.
 * @param data The data.
 * @returns Array of valid or spam results for each test case.
 */
function runSpamDetection(data: string[]) {
    const results = data.map((value) => {
        return spamcheck.detect(value) === 'spam' ? 'spam' : 'valid';
    });
    return results;
}


// TODO: Implement: https://www.npmjs.com/package/spamc
// spamc is a nodejs module that connects to spamassassin's spamd daemon using the spamc interface.

// function runSpamc(data: string[]): void{
//     const Spamc = new spamc();
//     // const results = data.map((testCase: string) => {
        
//     // });
//     Spamc.report(data[0], function (result: string[]) {
//         console.log(result)
//     })


// }

/**
 * Implement: https://www.npmjs.com/package/bad-words
 * A javascript filter for badwords
 * @param data The array of test cases to test the package
 * @returns Array of valid or spam results for each test case.
 */ 
function runBadWords(data: string[]) {
    const bad_words = new badWords();
    const results = data.map((testCase: string) => {
        return (bad_words.isProfane(testCase)) ? 'spam' : 'valid';
    });

    return results;
}

/**
 * Implement: https://www.npmjs.com/package/leo-profanity
 * Profanity filter, based on "Shutterstock" dictionary
 * @param data The array of test cases to test the package
 * @returns Array of valid or spam results for each test case.
 */ 
function runLeoProfanity(data: string[]) {
    const results = data.map((testCase: string) => {
        return (leo.check(testCase)) ? 'spam' : 'valid';
    });

    return results;
}

/**
 * Implement: https://npm.io/package/retext-profanities
 * retext plugin to check for profane and vulgar wording. Uses cuss for sureness.
 * @param data The array of test cases to test the package
 * @returns Array of valid or spam results for each test case.
 */ 
function runRetextProfanities(data: string[]) {
    const results: string[] = [];
    data.forEach(testCase =>
        unified()
        .use(english)
        .use(profanities)
        .use(stringify)
        .process(testCase, function(err: string, output: string) {
            const warnings = new RegExp(/\bwarnings|warning\b/g);
            results.push((warnings.test(report(output))) ? 'spam' : 'valid');
        })
    );

    return results;
}

/**
 * Profanity detection and filtering library.
 * @param data is the array of test cases to be ran through the filter
 * @returns Array of valid or spam results for each test case.
 */
function runSwearJar(data: string[]) {
    const results = data.map((testCase: string) => {
        const result = swearjar.profane(testCase);

        if (result == true) {
            return "spam"
        }
        if (result == false) {
            return "valid"
        }

        console.log(result);
    });

    return results;
}

/**
 * A better profanity filter.
 * @param data is the array of test cases to be ran through the filter
 * @returns Array of valid or spam results for each test case.
 */
function runCensorSensor(data: string[]) {
    const censor = new censorSensor.CensorSensor();
    const results = data.map((testCase: string) => {
        const result = censor.isProfane(testCase)

        if (result == true) {
            return "spam"
        }
        if (result == false) {
            return "valid"
        }

        
    });
    return results;
}

/**
 * An advanced profanity filter based on English phonetics (how stuff sounds).
 * @param data is the array of test cases to be ran through the filter
 * @returns Array of valid or spam results for each test case.
 */
function runNoSwearing(data: string[]) {
    const results = data.map((testCase: string) => {
        const result = noSwearing(testCase);

        if (result.length == 0) {
            return "valid"
        }
        if (result.length >= 1) {
            return "spam"
        }
    });

    return results;
}

/**
 * A lightweight javascript detector and filter for profanity words / bad words written in typescript
 * @param data is the array of test cases to be ran through the filter
 * @returns Array of valid or spam results for each test case.
 */
function runProfanease(data: string[]) {
    let isProfane = new Profanease({lang : 'all'});
    const results = data.map((testCase: string) => {
        if (isProfane.check(testCase) == true) {
            return "spam"
        }
        if (isProfane.check(testCase) == false) {
            return "valid"
        }
    });
    
    return results;
}

/**
 * An easy-to-use word filter with advanced detection techniques. A lightweight package with zero dependencies.
 * @param data is the array of test cases to be ran through the filter
 * @returns Array of valid or spam results for each test case.
 */
 function runBadWordsFilter(data: string[]) {
    const config = {list: googleProfanityWords.list()}
    const filter = new Filter(config);
    const results = data.map((testCase: string) => {
        if (filter.isUnclean(testCase) == true) {
            return "spam"
        }
        if (filter.isUnclean(testCase) == false) {
            return "valid"
        }
    });
    
    return results;
}


// TODO: Implement: https://npm.io/package/google-profanity-words
// Full List of Bad Words and Top Swear Words Banned by Google. As they closed the api (will most likely be used in conjuntion with other spam filters)

/**
 * The main function.
 * @returns Array of valid or spam results for each test case.
 */
async function main() {
    const data = importData();
    let results: string[];

    results = runProfanease(data);
    await addToCsv(CsvColumnName.ProfaneaseOutput, results);

    results = runNoSwearing(data);
    await addToCsv(CsvColumnName.NoswearingOutput, results);

    results = runSwearJar(data);
    await addToCsv(CsvColumnName.SwearjarOutput, results);

    results = runCensorSensor(data);
    await addToCsv(CsvColumnName.CensorSensorOutput, results);

    results = runSpamDetection(data);
    await addToCsv(CsvColumnName.SpamDetectionOutput, results);

    results = runBadWords(data);
    await addToCsv(CsvColumnName.BadWordsOutput, results);

    results = runLeoProfanity(data);
    await addToCsv(CsvColumnName.LeoProfanitiesOutput, results);

    results = runRetextProfanities(data);
    await addToCsv(CsvColumnName.RetextProfanitiesOutput, results);

    results = runSpamFilter(data);
    await addToCsv(CsvColumnName.SpamFilterOutput, results);

    results = runSpamCheck(data);
    await addToCsv(CsvColumnName.SpamCheckOutput, results);

    results = runBadWordsFilter(data);
    await addToCsv(CsvColumnName.BadWordsFilterOutput, results);
}

main();