const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');
const path = require('path');
let request = require('request')

const tempPath = './temp.json'

const toSolveJson = fs.readFileSync(tempPath)

let mySolveData = JSON.parse(toSolveJson)
mySolveData=mySolveData.slice(0,1)
//finish 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16

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
        let p=getParentNodeUntilP(img)
        let desc=getDescByP(p,'')
        if(desc.trim()==''){
            p=getNextNode(p)
            desc==getDescByP(p,'')
        }
        returnArr.push(img.attribs['data-orig-file'])
    }
    return returnArr;
}

function getDescByP(p,desc){
    if(p.children.length!==0){
        for(let item of p.children){
            if(item.data!=undefined){
                desc+=item.data
            }else{
                desc+=getDescByP(item,desc)
            }
        }
        return desc
    }else{
        return ''
    }
}

function getParentNodeUntilP(node){
    while(node.parent.name!=='p'){
        node=node.parent
    }
    return node.parent
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
