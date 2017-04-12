#!/usr/bin/env node

var argv = process.argv.slice(2);
var fs = require('fs')
var request = require('request');
var cmd = require('node-cmd');
var tmp = require('tmp');

var fullidno = argv[0]
var idno = argv[0].slice(-4)
var bidno = argv[1]

var getTmpExtFileName = function (ext) {
  return  tmp.tmpNameSync() + '.' + ext;
}

var query = function(cookieString) {
  var tmpValiCodeName = getTmpExtFileName('png')
  var tmpConvertValiCodeFile = getTmpExtFileName('png')
  var tmpCaptchaSolution = tmp.tmpNameSync();
  var cookie

  // get an validation code image
  request(`http://www.alltobid.com/GPCarQuery.Web/Image/ValiCode?r=${Math.random()}`, function (err, resp, body) {
    cookie = resp.headers['set-cookie'][0]
    cookie = cookie.slice(0, cookie.indexOf(';'))
  })
    .pipe(fs.createWriteStream(tmpValiCodeName).on('close', function () {
      cmd.get(`${__dirname}/fuzzythresh.sh ${tmpValiCodeName} ${tmpConvertValiCodeFile}`, function () {
        cmd.get(`tesseract ${tmpConvertValiCodeFile} ${tmpCaptchaSolution} -psm 8`, function () {
          fs.readFile(tmpCaptchaSolution + '.txt', 'utf8', function (err, valicode) {

            // remove tmp files
            fs.unlinkSync(tmpValiCodeName)
            fs.unlinkSync(tmpConvertValiCodeFile)
            fs.unlinkSync(tmpCaptchaSolution + '.txt')

            valicode = valicode.replace(/\r?\n|\r/g, "");

            var valicodeNumber = +valicode

            if(isNaN(valicodeNumber) || valicode.length !== 4) {
              query()
            } else {
              var options = {
                url: 'http://www.alltobid.com/GPCarQuery.Web/Home/Query',
                headers: {
                  'Referer': 'http://www.alltobid.com/gpcarquery.web/home/personal',
                  'Content-Type' : 'application/x-www-form-urlencoded',
                  'Cookie': cookie,
                  'User-Agent' : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
                  'Origin': 'http://www.alltobid.com',
                  'Pragma': 'no-cache',
                  'Host': 'www.alltobid.com',
                  'Cache-Control': 'no-cache',
                  'If-Modified-Since': 0
                },
                form: {
                  idcard: idno,
                  number: bidno,
                  type: 2,
                  code: valicode
                }
              };
              request.post(options, function (err, resp, body) {
                var bodyParsed = JSON.parse(body)

                if(bodyParsed.code === 4) {
                  query()
                } else if(bodyParsed.code === 2) {
                  console.log(fullidno, bidno, "为以下情况：1. 为上一场拍卖会结束后的新增用户 2. 为已超过半年有效期的失效用户 3. 为已超过可投标次数的失效用户")
                } else if(bodyParsed.code === 0) {
                  var {ClientName, used, validdate} = bodyParsed
                  console.log(ClientName, "\t",  used, validdate, bidno, fullidno)
                } else {
                  console.log(fullidno, bidno, "状态不明")
                }
              })
            }
          })
        })
      })
  }))
}

query()
