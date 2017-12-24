var superagent = require('superagent')
var express = require('express')
var cheerio = require('cheerio')
var Url = require('url')
var app = express()

app.set('port',process.env.PORT || 8080);

var entryUrl = 'https://movie.douban.com/top250'

app.get('/', function(req, res, next) {
  var _res = res

  superagent.get(entryUrl)
    .end(function(err, res) {
      if (err) console.log(err)
      else {
        var fullUrlsArr = []
        getPageUrls(res.text).then(urls => {
         
          urls.forEach(function (url) {
            superagent.get(url)
              .end(function (err, res) {
                if (err) console.log(err)
                fullUrls(res.text).then(arrs => {
                  for (i in arrs) {
                    fullUrlsArr.push(arrs[i])
                  }
                })
              })
          })
        console.log(fullUrlsArr)
        })
         
      }
    })

  }) 
  

function getPageUrls (html,cb) {
  var $ = cheerio.load(html)
  // 第一个链接即为入口url
  var urls = ['https://movie.douban.com/top250?start=0&filter='] 
  var item = $('.paginator > a')
  return new Promise((resolve, reject) => {
    item.each(function (index) {
      urls.push(Url.resolve(entryUrl, $(this).attr('href')))
    })
    resolve(urls)
  })
}

function fullUrls(html) {
  var $ = cheerio.load(html)
  var urls = []
  var items = $('.grid_view').find('li')

  return new Promise((resolve, reject) => {
    items.each(function (index) {
      var _this = $(this)
      var urlObj = {
        title: _this.find('.hd a .title').text(),
        url: _this.find('.hd a').attr('href')
      }
      urls.push(urlObj)
    })
    resolve(urls)
  })
}

app.listen(8080, function () {
  console.log('app is listening 8080 port')
});