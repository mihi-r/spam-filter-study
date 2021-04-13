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


const NS_PER_SEC = 1e9;

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
 * @returns Array of [results, times in nanoseconds]
 */
function runSpamFilter(data: string[]): [string[], string[]] {
    const times: string[] = [];
    const results = data.map((testCase) => {
        const start = process.hrtime();
        const result = filter.isSpam(testCase) ? 'spam' : 'valid';
        const diff = process.hrtime(start);
        times.push(String(diff[0] * NS_PER_SEC + diff[1]));
        return result;
    });

    return [results, times];
}

/**
 * Implement: https://www.npmjs.com/package/spam-check
 * A simple node module for checking for spam in user inputs
 * @param data The data.
 * @returns Array of [results, times in nanoseconds]
 */
function runSpamCheck(data: string[]): [string[], string[]] {
    const times: string[] = [];
    const results = data.map((testCase) => {
        let result: string = '';

        const start = process.hrtime();
        spamCheck({ 'string':testCase }, function(_err: any, checkResult: { spam: boolean }) {
            result = checkResult.spam ? 'spam' : 'valid';
        });
        const diff = process.hrtime(start);
        times.push(String(diff[0] * NS_PER_SEC + diff[1]));
    
        return result;
    });

    return [results, times];
}

/**
 * Implement: https://www.npmjs.com/package/spam-detection
 * Small package based on Naive Bayes classifier to classify messages as spam or ham.
 * @param data The data.
 * @returns Array of [results, times in nanoseconds]
 */
function runSpamDetection(data: string[]): [string[], string[]] {
    const times: string[] = [];

    const results = data.map((value) => {
        const start = process.hrtime();
        const result = spamcheck.detect(value) === 'spam' ? 'spam' : 'valid';
        const diff = process.hrtime(start);
        times.push(String(diff[0] * NS_PER_SEC + diff[1]));

        return result;
    });

    return [results, times];
}

/**
 * Implement: https://www.npmjs.com/package/bad-words
 * A javascript filter for badwords
 * @param data The array of test cases to test the package
 * @returns Array of [results, times in nanoseconds]
 */ 
function runBadWords(data: string[]): [string[], string[]] {
    const times: string[] = [];

    const bad_words = new badWords();
    const results = data.map((testCase: string) => {
        const start = process.hrtime();
        const result =  (bad_words.isProfane(testCase)) ? 'spam' : 'valid';
        const diff = process.hrtime(start);
        times.push(String(diff[0] * NS_PER_SEC + diff[1]));

        return result;
    });

    return [results, times];
}

/**
 * Implement: https://www.npmjs.com/package/leo-profanity
 * Profanity filter, based on "Shutterstock" dictionary
 * @param data The array of test cases to test the package
 * @returns Array of [results, times in nanoseconds]
 */ 
function runLeoProfanity(data: string[]): [string[], string[]] {
    const times: string[] = [];

    const results = data.map((testCase: string) => {
        const start = process.hrtime();
        const result = (leo.check(testCase)) ? 'spam' : 'valid';
        const diff = process.hrtime(start);
        times.push(String(diff[0] * NS_PER_SEC + diff[1]));
        return result;
    });

    return [results, times];
}

/**
 * Implement: https://npm.io/package/retext-profanities
 * retext plugin to check for profane and vulgar wording. Uses cuss for sureness.
 * @param data The array of test cases to test the package
 * @returns Array of [results, times in nanoseconds]
 */ 
function runRetextProfanities(data: string[]): [string[], string[]] {
    const results: string[] = [];
    const times: string[] = [];

    data.forEach(testCase => {
        unified()
        .use(english)
        .use(profanities)
        .use(stringify)
        .process(testCase, function(_err: string, output: string) {
            const warnings = new RegExp(/\bwarnings|warning\b/g);
            const start = process.hrtime();
            results.push((warnings.test(report(output))) ? 'spam' : 'valid');
            const diff = process.hrtime(start);
            times.push(String(diff[0] * NS_PER_SEC + diff[1]));   
        })
    });

    return [results, times];
}

/**
 * Profanity detection and filtering library.
 * @param data is the array of test cases to be ran through the filter
 * @returns Array of [results, times in nanoseconds]
 */
function runSwearJar(data: string[]): [string[], string[]] {
    const times: string[] = [];
    const results = data.map((testCase: string) => {
        const start = process.hrtime();
        const result = swearjar.profane(testCase);
        const diff = process.hrtime(start);
        times.push(String(diff[0] * NS_PER_SEC + diff[1]));

        if (result == true) {
            return "spam"
        }
        if (result == false) {
            return "valid"
        }

        console.log(result);
    });

    return [results, times];
}

/**
 * A better profanity filter.
 * @param data is the array of test cases to be ran through the filter
 * @returns Array of [results, times in nanoseconds]
 */
function runCensorSensor(data: string[]): [string[], string[]] {
    const times: string[] = [];
    const censor = new censorSensor.CensorSensor();
    const results = data.map((testCase: string) => {
        const start = process.hrtime();
        const result = censor.isProfane(testCase)
        const diff = process.hrtime(start);
        times.push(String(diff[0] * NS_PER_SEC + diff[1]));
        
        if (result == true) {
            return "spam"
        }
        if (result == false) {
            return "valid"
        }

        
    });
    return [results, times];
}

/**
 * An advanced profanity filter based on English phonetics (how stuff sounds).
 * @param data is the array of test cases to be ran through the filter
 * @returns Array of [results, times in nanoseconds]
 */
function runNoSwearing(data: string[]): [string[], string[]] {
    const times: string[] = [];
    const results = data.map((testCase: string) => {
        const start = process.hrtime();
        const result = noSwearing(testCase);
        const diff = process.hrtime(start);
        times.push(String(diff[0] * NS_PER_SEC + diff[1]));
        if (result.length == 0) {
            return "valid"
        }
        if (result.length >= 1) {
            return "spam"
        }
    });

    return [results, times];
}

/**
 * A lightweight javascript detector and filter for profanity words / bad words written in typescript
 * @param data is the array of test cases to be ran through the filter
 * @returns Array of [results, times in nanoseconds]
 */
function runProfanease(data: string[]): [string[], string[]] {
    const times: string[] = [];
    let isProfane = new Profanease({lang : 'all'});
    const results = data.map((testCase: string) => {
        const start = process.hrtime();
        const isSpam = isProfane.check(testCase);
        const diff = process.hrtime(start);
        times.push(String(diff[0] * NS_PER_SEC + diff[1]));
        if (isSpam == true) {            
            return "spam";
        }
        if (isSpam == false) {
            return "valid";
        }
    });
    
    return [results, times];
}

/**
 * An easy-to-use word filter with advanced detection techniques. A lightweight package with zero dependencies.
 * @param data is the array of test cases to be ran through the filter
 * @returns Array of [results, times in nanoseconds]
 */
 function runBadWordsFilter(data: string[]): [string[], string[]] {
    const times: string[] = [];
    const config = {list: googleProfanityWords.list()}
    const filter = new Filter(config);
    const results = data.map((testCase: string) => {
        const start = process.hrtime();
        if (filter.isUnclean(testCase) == true) {
            const diff = process.hrtime(start);
            times.push(String(diff[0] * NS_PER_SEC + diff[1]));
            return "spam";
        }
        if (filter.isUnclean(testCase) == false) {
            const diff = process.hrtime(start);
            times.push(String(diff[0] * NS_PER_SEC + diff[1]));
            return "valid";
        }
    });
    
    return [results, times];
}

/**
 * The main function.
 * @returns Array of valid or spam results for each test case.
 */
async function main() {
    const data = importData();
    let results: [string[], string[]];

    results = runProfanease(data);
    await addToCsv(CsvColumnName.ProfaneaseOutput, results[0]);
    await addToCsv(CsvColumnName.ProfaneaseRuntime, results[1]);

    results = runNoSwearing(data);
    await addToCsv(CsvColumnName.NoswearingOutput, results[0]);
    await addToCsv(CsvColumnName.NoswearingRuntime, results[1]);

    results = runSwearJar(data);
    await addToCsv(CsvColumnName.SwearjarOutput, results[0]);
    await addToCsv(CsvColumnName.SwearjarRuntime, results[1]);

    results = runCensorSensor(data);
    await addToCsv(CsvColumnName.CensorSensorOutput, results[0]);
    await addToCsv(CsvColumnName.CensorSensorRuntime, results[1]);

    results = runSpamDetection(data);
    await addToCsv(CsvColumnName.SpamDetectionOutput, results[0]);
    await addToCsv(CsvColumnName.SpamDetectionRuntime, results[1]);

    results = runBadWords(data);
    await addToCsv(CsvColumnName.BadWordsOutput, results[0]);
    await addToCsv(CsvColumnName.BadWordsRuntime, results[1]);

    results = runLeoProfanity(data);
    await addToCsv(CsvColumnName.LeoProfanitiesOutput, results[0]);
    await addToCsv(CsvColumnName.LeoProfanitiesRuntime, results[1]);

    results = runRetextProfanities(data);
    await addToCsv(CsvColumnName.RetextProfanitiesOutput, results[0]);
    await addToCsv(CsvColumnName.RetextProfanitiesRuntime, results[1]);

    results = runSpamFilter(data);
    await addToCsv(CsvColumnName.SpamFilterOutput, results[0]);
    await addToCsv(CsvColumnName.SpamFilterRuntime, results[1]);

    results = runSpamCheck(data);
    await addToCsv(CsvColumnName.SpamCheckOutput, results[0]);
    await addToCsv(CsvColumnName.SpamCheckRuntime, results[1])

    results = runBadWordsFilter(data);
    await addToCsv(CsvColumnName.BadWordsFilterOutput, results[0]);
    await addToCsv(CsvColumnName.BadWordsFilterRuntime, results[1]);
}

main();