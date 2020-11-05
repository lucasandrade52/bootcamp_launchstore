const express = require('express')
const routes = express.Router()

const HomeController = require('../app/controllers/HomeController')

const products = require('./products')
const users = require('./users')

// users
routes.use('/users', users)

// home
routes.get('/', HomeController.index)

//products
routes.use('/products', products)

// Alias
routes.get('/ads/create', function(req, res) {
    return res.redirect("/products/create")
})

routes.get('/accounts', function(req, res) {
    return res.redirect("/users/login")
})
module.exports = routes