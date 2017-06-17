const express = require('express')
const app = express()
app.use("/api/", (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next()
})
var Nightmare = require('nightmare');

app.get('/api/cart/add/:url/:size', function (req, res) {
    addToCart(req.params.url, req.params.size, () => res.send({ status: 1 }))

})

app.get('/api/info/:item', function (req, res) {
    itemInfo(req.params.item, (info) => res.send(info));
})


app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.sendFile(__dirname + "docs.html")
})

app.get('/api/search/:searchQuery', function (req, res) {
    search(req.params.searchQuery, (results) => {
        res.send(results);
    })
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})

function addToCart(itemUrl, size, callback) {
    var nightmare = Nightmare({ show: false });
    var loginUrl = "https://shop.adidas.ae/en/customer/account/login/referer/"
    console.log(loginUrl)
    nightmare
        .goto(loginUrl)
        .wait(100)
        .insert("#email", "evansantonio32@gmail.com")
        .insert("#pass", "adidas.3u")
        .click("button.button.button--lg.button--info.button--login")
        .wait(400)
        .goto(itemUrl)
        .wait(200)
        .evaluate(function (size) {
            Array.prototype.slice.call(document.querySelectorAll(".js-size-value ")).filter((v) => v.textContent == size)[0].click()
            document.querySelector(".button--product-add.js-add-to-bag").click()
            return;
        }, size)
        .then(() => callback())



}

function itemInfo(itemUrl, callback) {
    var nightmare = Nightmare({ show: false });

    nightmare
        .goto(itemUrl)
        .wait(100)
        .evaluate(function () {
            var item = {
                color: document.querySelector(".product__color").textContent.trim().replace("Color ", ""),
                sizes: Array.prototype.slice.call(document.querySelectorAll(".product-size .js-size-value")).filter((size) => !size.className.includes("disabled")).map((size) => (size.textContent)),
                priceAED: document.querySelector(".price").textContent.replace("AED", ""),
                genders: Array.prototype.slice.call(document.querySelectorAll(".gender a")).map((gender) => gender.textContent),
                name: document.querySelector(".product__name.product__name--big-screen h1").textContent,
                category: document.querySelector(".division a").textContent,
                status: 1
            }
            return item;
            //return document.querySelectorAll(".table-of-contents__title a")
        }).end()
        .then(function (item) {
            //console.log(JSON.stringify(courses));


            item.link = itemUrl;
            callback(item)

            /* var tasks = courses.map((course, index) => (
                 (callback) => {
                     scrape(course, index, callback)
                 }
             ))
             require("async.parallellimit")(tasks, 1, function () {});*/
        })

}

function search(searchQuery, callback) {
    var nightmare = Nightmare({ show: false });

    var searchUrl = "https://shop.adidas.ae/en/search?q=" + searchQuery.split(" ").join("+")

    nightmare
        .goto(searchUrl)
        .wait(150)
        .evaluate(function () {
            var items = Array.prototype.slice.call(document.querySelectorAll("#products-list .card__link.card__link--text")).map((item) => ({ name: item.title, link: item.href }))
            return items;
            //return document.querySelectorAll(".table-of-contents__title a")
        }).end()
        .then(function (items) {
            //console.log(JSON.stringify(courses));


            callback({
                items: items,
                status: 1,
                length: items.length,
                url: searchUrl,
                terms: searchQuery.split(" ")
            })

            /* var tasks = courses.map((course, index) => (
                 (callback) => {
                     scrape(course, index, callback)
                 }
             ))
             require("async.parallellimit")(tasks, 1, function () {});*/
        })

}

/*function scrape(course, index, callback) {
    nightmare.goto(course.url)
        .wait("video")
        .wait(1000)
        .evaluate(() => {
            var src = document.querySelector("video").src
            return src
        }).then((result) => {
            //console.log(result)

            if (!result) {
                scrape(...arguments)
                return
            }

            course.src = result
            saveVideo(course, index + 1)
            callback()
        })
}

function saveVideo(course, number) {
    console.log(number);
    if (!fs.existsSync("videos/")) {
        fs.mkdirSync("videos/");
    }
    if (!fs.existsSync("videos/" + saveTo)) {
        fs.mkdirSync("videos/" + saveTo);
    }
    if (fs.existsSync("videos/" + saveTo + "/" + number + ". " + course.name.replace("/", "") + ".webm")) {
        return;
    }
    var file = fs.createWriteStream("videos/" + saveTo + "/" + number + ". " + course.name.replace("/", "") + ".webm");
    var request = http.get(course.src, function (response) {
        response.pipe(file);
    });
}*/