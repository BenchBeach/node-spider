const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');
const path = require('path');

const tempPath='./temp.json'

const toSolveJson=fs.readFileSync(tempPath)

const mySolveData=JSON.parse(toSolveJson)

testUrl='https://theframeblog.com/2020/10/20/framing-in-the-roman-era/'

https.get(testUrl, (res) => {
    let rawData = '';
    res.on('data', (chunk) => {
        rawData += chunk;
    });
    res.on('end', () => {
        try {
            downPage(rawData)
        } catch (e) {
            console.error(e.message);
        }
    });
}).on('error', (e) => {
    console.error(`出现错误: ${e.message}`);
});

function downPage(page){
    const $ = cheerio.load(data);
    const entryContent = $('.entry-content')
    
}