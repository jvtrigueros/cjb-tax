'use strict'

var iron_worker = require('iron_worker')
  , request = require('request')

var params = iron_worker.params()

var wufoo = params.wufoo
  , formData = params.formData

request.debug = true

var requestHandler = function (err, res, body) {
  if(!err) {
    console.log(body)
  } else {
    console.log(err)
  }
}

request( { headers: { 'Authorization': 'Basic ' + new Buffer(wufoo.key + ':cheesecake').toString('base64')
                    , 'Content-Type': 'application/x-www-form-urlencoded'
                    , 'Content-Length': Buffer.byteLength(formData)
                    }
         , uri: wufoo.url + '/api/v3/forms/contact-us/entries.json'
         , body: formData
         , method: 'POST'
         }
       , requestHandler
       )