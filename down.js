const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');
const path = require('path');
let request = require('request')

const tempPath = './temp.json'

const toSolveJson = fs.readFileSync(tempPath)

let mySolveData = JSON.parse(toSolveJson)

mySolveData=mySolveData.slice(4,5)
//finish 1-2-3-4

downArr = []
const downloadPath = './download'

if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath)
}
for (let item of mySolveData) {
    let {smallTitle, liArr} = item[0]
    smallTitle=getPath(smallTitle)
    const smallDir = `${downloadPath}/${smallTitle}`
    if (!fs.existsSync(smallDir)) {
        fs.mkdirSync(smallDir)
    }
    for (let page of liArr) {
        let text=getPath(page.text)
        const pageDir=`${smallDir}/${text}`
        if (!fs.existsSync(pageDir)) {
            fs.mkdirSync(pageDir)
        }
        getPage(page.href,pageDir)
    }
}

function getPath(str){
    str=str.replace(/[:*?|]/g,',')
    str=str.replace(/["<>]/g, "'");
    return str
}

function getPage(url,path){
    https.get(url, (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
            rawData += chunk;
        });
        res.on('end', () => {
            try {
                downPage(rawData, path)
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.error(`出现错误: ${e.message}`);
    });
}

function getAllImg(ps) {
    let returnArr = []
    for (let psIndex in ps) {
        let item=ps[psIndex]
        console.log(psIndex)
        if(psIndex=='length')break;
        // if (item.children[0] && item.children[0].name === 'strong') {
        //     if((!item.children[0].children)||(!item.children[0].children[0].children)) continue
        //     aTag = item.children[0].children[0].children[0]
        //     if(aTag.attribs==undefined) console.log('here1')
        //     returnArr.push({
        //         desc: '',
        //         url: aTag.attribs.href
        //     })
        // }else
        if(item.children[0] && item.children[0].name === 'img'){
            let desc = ''
            imgTag = item.children[0]
            for (let inside of item.children) {
                if (inside.type === 'text') {
                    desc += inside.data
                } else if(inside.type === 'tag'&&inside.name=='a'){
                    desc += inside.children[0].data
                }
            }
            if(imgTag.attribs==undefined) console.log('here2')
            returnArr.push({
                desc,
                url: imgTag.attribs['data-orig-file']
            })
        }else if (item.children[0] && item.children[0].name === 'a' &&item.attribs&& item.attribs.style !== 'text-align:center;') {
            let desc = ''
            aTag = item.children[0]
            imgTag=aTag.children[0]
            if(getNextNode(item).attribs==undefined) console.log('here3')
            if (getNextNode(item).attribs&&getNextNode(item).attribs.style === 'text-align:center;') {
                for (let inside of getNextNode(item).children) {
                    if (inside.type === 'text') {
                        desc += inside.data||''
                    } else if(inside.type === 'tag'&&inside.name=='a'){
                        desc += inside.children[0].data
                    }
                }
            }
            if(aTag.attribs==undefined) console.log('here1')
            returnArr.push({
                desc,
                url: imgTag.attribs['data-orig-file']
            })
        } else if (item.children[0] && item.children[0].name === 'a'&&item.children[0].attribs && /([^\s]+(?=\.(webp|jpg|png|jpeg))\.\2)/gi.test(item.children[0].attribs.href)) {
            aTag = item.children[0]
            imgTag=aTag.children[0]
            if(aTag.attribs==undefined) console.log('here11')
            let desc = ''
            for (let inside of item.children) {
                if (inside.type === 'text') {
                    desc += inside.data||''
                } else if(inside.type === 'tag'&&(inside.name=='a'||inside.name=='em')){
                    desc += inside.children[0].data
                }
            }
            returnArr.push({
                desc,
                url: imgTag.attribs['data-orig-file']
            })
        }
    }
    return returnArr;
}

function getNextNode(node) {
    if (node.next.type !== 'tag') {
        return getNextNode(node.next)
    } else if (node.next.type === 'tag') {
        return node.next
    } else {
        return {name: 'null'}
    }
}

function downPage(page, path) {
    const $ = cheerio.load(page);
    const entryContent = $('.entry-content')
    let temp;
    if(entryContent.children('p').length==0){
        temp=entryContent.children('div').children('p')
    }else{
        temp=entryContent.children('p')
    }
    let toDownArr = getAllImg(temp)
    downImg(toDownArr, path)
}

function downImg(arr, path) {
    let str = ''
    for (let index in arr) {
        let {desc, url} = arr[index]
        if (!/([^\s]+(?=\.(jpg|png|jpeg))\.\2)/gi.test(url)) {
            continue
        }
        let fileName = url.split('/').pop()
        str += `${desc}|${fileName}\n`
        request(url).pipe(
            fs.createWriteStream(`${path}/${fileName}`).on('close', err => {
                console.log('写入', err)
            })
        )
    }
    fs.writeFileSync(`${path}/describeFile.csv`, str)
}
