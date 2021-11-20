const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');
const path = require('path');

let treeRoot = []

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

function getBigTitle(array) {
    for (let item of array) {
        if (getNextNode(item).name == 'p') {
            bigTitle = getNextNode(item).children[0].data
            getSmallTitle(getNextNode(item),bigTitle)
        }else{
            getSmallTitle(item)
        }
    }
}

function getSmallTitle(item,bigTitle=''){
    smallTitle=item.children[0].data
    
}

function getNextNode(node){
    if(node.next.type!='tag'){
        return getNextNode(node.next)
    }else if (node.next.type=='tag'){
        return node.next
    }else{
        return {name:'null'}
    }
}

function getData(data) {
    const $ = cheerio.load(data);
    const entryContent = $('.entry-content')
    getBigTitle(entryContent.children('p'))
}