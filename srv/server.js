
"use strict";

const cds = require("@sap/cds");
const cds_swagger = require ('cds-swagger-ui-express');
const cov2ap = require("@cap-js-community/odata-v2-adapter");

var express = require('express')
var cors = require('cors')
var app = express() 

/*
app.options('/products/:id', cors()) 
// enable pre-flight request for DELETE request
app.del('/products/:id', cors(), function (req, res, next) { 
    res.json({msg: 'This is CORS-enabled for all origins!'})
}) 
app.listen(80, function () { 
    console.log('CORS-enabled web server listening on port 80')
})
*/
cds.on("bootstrap", app => {
    app.use(
        [           
      
            (req, res, next) => {
                const { origin } = req.headers
                // standard request
                res.set('access-control-allow-origin', origin);
                // preflight request
                if (origin  && req.method === 'OPTIONS')
                    return res.set('access-control-allow-methods', 'GET,HEAD,PUT,PATCH,POST,DELETE').end()
                next()
            },

            cov2ap(),

            cds_swagger(
                {
                    "diagram": "true"
                }
            ),
            cors({ origin: '*'})
        ]
    )
});

module.exports = cds.server;