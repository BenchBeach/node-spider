const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');
const path = require('path');

function write2file(name,data){
    fs.writeFileSync(name,data)
}

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
    let writeArr=[]
    for (let item of array) {
        if (getNextNode(item).name == 'p') {
            bigTitle = getNextNode(item).children[0].data
            // writeArr.push(getSmallTitle(getNextNode(item),bigTitle))
        }else{
            writeArr.push(getSmallTitle(item))
        }
    }
    write2file('temp.json',JSON.stringify(writeArr))
}

function getSmallTitle(item,bigTitle=''){
    smallTitle=item.children[0].data
    let smallArr=[]
    while(getNextNode(item).name=='ul'){
        smallArr.push({
            bigTitle,
            smallTitle,
            liArr:getLi(getNextNode(item))
        })
        item=getNextNode(item)
    }
    return smallArr
}

function getLi(ul){
    let liChildren=ul.children.filter((item)=>{return item.name=='li'})
    let returnArr=[]
    for(let li of liChildren){
        const a=li.children[0]
        const text=a.children[0].data
        const href=a.attribs.href
        returnArr.push({
            text,
            href
        })
    }
    return returnArr
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