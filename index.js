var express = require('express')
var app = express()
var wrapper = require('./wrapper')
var isBusy = false
var proxyrotation = require('./proxyrotation')
var accounts = require('./accounts')
var bodyParser = require('body-parser')
var Xvfb = require('xvfb')
var xvfb = new Xvfb()
xvfb.startSync()

app.use(bodyParser.json({extended: true})) // get JSON data
app.use(bodyParser.urlencoded({extended: true}))

app.use('/api/*', (req, res, next) => {
  console.log('Hit API end point')
  res.setHeader('Content-Type', 'application/json')
  next()
})

function throttler (req, res, next) {
  if (isBusy) {
    console.log('Busy.. waiting a couple of seconds')
    setTimeout(() => throttler(req, res, next), 250)
  } else {
    console.log('Not busy! Go!')
    isBusy = true
    next()
  }
}

app.post('/api/cart/add/:url/:size', throttler, function (req, res) {
  wrapper.addToCart(req.params.url, req.params.size, accounts.getAccount(req.body.accountName), () => {
    res.json({ status: 1 })
    isBusy = false
  })
})

app.get('/api/info/:item', function (req, res) {
  wrapper.itemInfo(req.params.item, (info) => {
    res.json(info)
  })
})

app.get('/api/checkout', function(req, res) {
  res.json({'url': 'https://shop.adidas.ae/en/checkout/onepage/'})
})

app.get('/', function (req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.sendFile(__dirname + '/README.md')
})

app.get('/api/search/:account/:searchQuery', function (req, res) {
  wrapper.search(req.params.searchQuery, accounts.getAccount((req.params.account), (results) => {
    res.json(results)
  }))
})

app.post('/api/add/proxy', function (req, res) {
  var proxy = req.body.addr
  var port = req.body.port
  var name = req.body.name
  var user = req.body.user
  var pass = req.body.pass
  console.log(proxy)
  if (proxy && port && name) {
    proxyrotation.addProxy(name, proxy, port, user, pass)
    return res.json({status: 1})
  }
  return res.json({status: 0})
})

app.get('/api/delete/proxy/:name', function (req, res) {
  var name = req.params.name
  if (name) {
    proxyrotation.deleteProxy(name)
    return res.json({status: 1})
  }
  return res.json({status: 0})
})

app.get('/api/all/proxy', function (req, res) {
  res.json(proxyrotation.getAllProxies())
})

app.post('/api/add/account', function (req, res) {
  var name = req.body.name
  var email = req.body.email
  var pass = req.body.pass
  //var credit = req.body.credit
  accounts.addAccount(name, email, pass)
  res.json({status: 1})
})

app.get('/api/delete/account/:name', function (req, res) {
  var name = req.params.name
  accounts.removeAccount(name)
  res.json({status: 1})
})

app.get('/api/all/account', function (req, res) {
  res.json(accounts.allAccounts())
})

app.listen(3000, function () {
  console.log('app listening on port 3000!')
})
