require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')

const app = express()

var Moment = require('moment-timezone');
Moment().tz('America/New_York').format();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.use(express.json())


const dateFormated = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

app.get('/', (req, res) => {
  res.send(dateFormated)
})

app.use(function errorHandler(error, req, res, next) {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error'}}
  } else {
    //console.error('error found in app errorHandler', error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})


module.exports = app