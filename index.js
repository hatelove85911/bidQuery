var argv = process.argv.slice(2);
var fs = require('fs')
var request = require('request');
var cmd = require('node-cmd');
var tmp = require('tmp');

var getTmpExtFileName = function (ext) {
  return  tmp.tmpNameSync() + '.' + ext;
}


var query = function(cookieString) {
  cookieString = 'ASP.NET_SessionId=niuokkppr4v0wvkzara4dbs4'
  var tmpValiCodeName = getTmpExtFileName('png')
  var tmpConvertValiCodeFile = getTmpExtFileName('png')
  var tmpCaptchaSolution = tmp.tmpNameSync();

  // get an validation code image
  request(`http://www.alltobid.com/GPCarQuery.Web/Image/ValiCode?r=${Math.random()}`)
    .pipe(fs.createWriteStream(tmpValiCodeName).on('close', function () {
      cmd.get(`./fuzzythresh.sh ${tmpValiCodeName} ${tmpConvertValiCodeFile}`, function () {
        cmd.get(`tesseract ${tmpConvertValiCodeFile} ${tmpCaptchaSolution} -psm 8`, function () {
          fs.readFile(tmpCaptchaSolution + '.txt', 'utf8', function (err, valicode) {
            valicode = valicode.replace(/\r?\n|\r/g, "");

            var valicodeNumber = parseInt(valicode)

            console.log('valicodeNumber', valicodeNumber)
            console.log('valicode length', valicode.length )
            if(isNaN(valicodeNumber) || valicode.length !== 4) {
              query()
            } else {
              var options = {
                url: 'http://www.alltobid.com/GPCarQuery.Web/Home/Query',
                headers: {
                  'Referer': 'http://www.alltobid.com/gpcarquery.web/home/personal',
                  'Content-Type' : 'application/x-www-form-urlencoded',
                  'Cookie': cookieString,
                  'User-Agent' : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
                  'Origin': 'http://www.alltobid.com',
                  'Pragma': 'no-cache',
                  'Host': 'www.alltobid.com',
                  'Cache-Control': 'no-cache',
                  'If-Modified-Since': 0
                },
                form: {
                  idcard: argv[0].slice(-4),
                  number: argv[1],
                  type: 2,
                  code: valicode
                }
              };
              request.post(options, function (err, resp, body) {
                var bodyParsed = JSON.parse(body)
                console.log(valicode)
                console.log(bodyParsed)
                if(bodyParsed.code != 0) {
                   query()
                } else {
                  console.log(bodyParsed)
                }
              })
            }
          })
        })
      })
  }))
}

var getCookie = function () {
  request('http://www.alltobid.com/contents/16/80.html', function (err, resp, body) {
    // query(resp.headers['set-cookie'])
    query('ASP.NET_SessionId=niuokkppr4v0wvkzara4dbs4')
  })
}

getCookie()
