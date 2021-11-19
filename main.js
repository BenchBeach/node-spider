const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');

url = 'https://theframeblog.com/archives/'
https.get(url, (res) => {
    let rawData = '';
    res.on('data', (chunk) => {
        rawData += chunk;
    });
    res.on('end', () => {
        try {
            getData(rawData)
        } catch (e) {
            console.error(e.message);
        }
    });
}).on('error', (e) => {
    console.error(`出现错误: ${e.message}`);
});

function getData(data){
    const $ = cheerio.load(data);
    const entryContent=$('.entry-content')
    entryContent.find('p')
}
