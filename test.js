const request = require("request");
const fs = require("fs");
url='https://theframeblog.files.wordpress.com/2018/12/Fig-31-Mantegna-s-house-fresco-detail-2-Mantua.jpg'
request(url).pipe(
    fs.createWriteStream(`./1.jpg`).on('close', err => {
        console.log('写入', err)
    })
)
