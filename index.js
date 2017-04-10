var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs')
var request = require('request');
var cmd = require('node-cmd');
var tmp = require('tmp');

var getTmpExtFileName = function (ext) {
  return  tmp.tmpNameSync() + '.' + ext;
}
var query = function() {
  var tmpValiCodeName = getTmpExtFileName('png')
  var tmpConvertValiCodeFile = getTmpExtFileName('png')
  var tmpCaptchaSolution = tmp.tmpNameSync();

  // get an validation code image
  request('http://www.alltobid.com/GPCarQuery.Web/Image/ValiCode?r=0.9177529939509903')
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
                  'Content-Type' : 'application/x-www-form-urlencoded'
                },
                form: {
                  idcard: ('' + argv['_'][0]).slice(-4),
                  number: '' + argv['_'][1],
                  type: 2,
                  code: valicodeNumber
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
  

  // try query bid information
}

query()
