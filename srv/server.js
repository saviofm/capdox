
"use strict";

const cds = require("@sap/cds");
const cds_swagger = require ('cds-swagger-ui-express');
const cov2ap = require("@cap-js-community/odata-v2-adapter");



cds.on("bootstrap", app => {
    app.use(
        [           
      
            (req, res, next) => {
                const { origin } = req.headers
                // standard request
                res.setHeader('Access-Control-Allow-Origin', '*');
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
            )
        ]
    )
});

module.exports = cds.server;