const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');
const path = require('path');
let request = require('request')

const tempPath = './temp.json'

const toSolveJson = fs.readFileSync(tempPath)

let mySolveData = JSON.parse(toSolveJson)
console.log(mySolveData.length)
mySolveData=mySolveData.slice(20,21)
//finish 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16
// 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37

downArr = []
const downloadPath = './download_only_img'

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
    console.log(liArr.length)
    liArr=liArr.slice(12,20)
    //19
    //4 8 14
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
    for(let img of ps){
        returnArr.push(img.attribs['data-orig-file'])
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
    let toDownArr = getAllImg($('.entry-content').find('img'))
    downImg(toDownArr, path)
}

function downImg(arr, path) {
    let str = ''
    for (let index in arr) {
        let desc=''
        let url=arr[index].trim()
        url=encodeURI(url)
        if (!/([^\s]+(?=\.(webp|jpg|png|jpeg))\.\2)/gi.test(url)) {
            continue
        }
        let fileName = url.split('/').pop()
        str += `${desc}|${fileName}\n`
        console.log(url,`${path}/${fileName}`)
        try{
            request(url).pipe(
                fs.createWriteStream(`${path}/${fileName}`).on('close', err => {
                    console.log('写入', err)
                })
            )
        }catch(err){
            // console.log(err)
        }

    }
    fs.writeFileSync(`${path}/describeFile.csv`, str)
}
