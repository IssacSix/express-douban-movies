const superagent = require('superagent')
const async = require('async')
const express = require('express')
const cheerio = require('cheerio')
const Url = require('url')
const app = express()

app.set('port',process.env.PORT || 8080);

const entryUrl = 'https://movie.douban.com/top250'

app.get('/', function(req, res, next) {
  var _res = res

  superagent.get(entryUrl)
    .end(function(err, res) {
      if (err) console.log(err)
      else {
     
        getPageUrls(res.text).then(urls => {
      
          async.mapLimit(urls, 1, (url, cb) => {

            setTimeout( () => {

              superagent.get(url)
                .end(function (err, res) {
                  if (err) console.log(err)
                  fullUrls(res.text).then(arrs => {
                    cb(null, arrs)  
                  })
                })
              
            }, 3000)

          }, (err, result) => {
            _res.json({
              code: 200,
              des: 'success',
              data: result
            })
          })
          
        }).catch(res => {
          console.log(res)
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