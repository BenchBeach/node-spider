const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');
const path = require('path');
let request = require('request')

const tempPath='./temp.json'

const toSolveJson=fs.readFileSync(tempPath)

const mySolveData=JSON.parse(toSolveJson)

testUrl='https://theframeblog.com/2020/10/20/framing-in-the-roman-era/'

downArr=[]

https.get(testUrl, (res) => {
    let rawData = '';
    res.on('data', (chunk) => {
        rawData += chunk;
    });
    res.on('end', () => {
        try {
            downPage(rawData,'./testdir/')
        } catch (e) {
            console.error(e.message);
        }
    });
}).on('error', (e) => {
    console.error(`出现错误: ${e.message}`);
});

function getAllImg(ps) {
    let returnArr=[]
    for(let item of ps){
        if(item.children[0]&&item.children[0].name==='strong'){
            aTag=item.children[0].children[0].children[0]
            returnArr.push({
                desc:'',
                url:aTag.attribs.href
            })
        }else if(item.children[0]&&item.children[0].name==='a'&&item.attribs.style!=='text-align:center;'){
            let desc=''
            aTag=item.children[0]
            if(getNextNode(item).attribs.style==='text-align:center;'){
                for(let inside of getNextNode(item).children){
                    if(inside.type==='text'){
                        desc+=inside.data
                    }else{
                        desc+=inside.children[0].data
                    }
                }
            }
            returnArr.push({
                desc,
                url:aTag.attribs.href
            })
        }else if(item.children[0]&&item.children[0].name==='a'&&/([^\s]+(?=\.(jpg|png|jpeg))\.\2)/gi.test(item.children[0].attribs.href)){
            aTag=item.children[0]
            let desc=''
            for(let inside of item.children){
                if(inside.type==='text'){
                    desc+=inside.data
                }else{
                    desc+=inside.children[0].data
                }
            }
            returnArr.push({
                desc,
                url:aTag.attribs.href
            })
        }
    }
    return returnArr;
}

function getNextNode(node){
    if(node.next.type!=='tag'){
        return getNextNode(node.next)
    }else if (node.next.type==='tag'){
        return node.next
    }else{
        return {name:'null'}
    }
}

function downPage(page,path){
    const $ = cheerio.load(page);
    const entryContent = $('.entry-content')
    let toDownArr=getAllImg(entryContent.children('p'))
    toDownArr.forEach(downF)
}


let downF=(item,index)=>{
    let fileName=item.url.split('/').pop()
    request(item.url).pipe(
        fs.createWriteStream(`./test/${fileName}`).on('close',err=>{  console.log('写入',err) })
    )
}
