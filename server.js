/*
@file server.js
@author Entire team
@date 2/18/2022
@brief File that sets up server
*/

var express = require('express')

var app = express()
var server = app.listen(3000)

app.use(express.static('public'))

console.log('My server is running')
//var io = socket(server)
