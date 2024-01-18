const cds = require('@sap/cds');
const validation = require('./common/validation')
const crud = require('./common/crud')
const xsenv = require("@sap/xsenv");
//const AWS = require('aws-sdk');
const {  S3Client } = require("@aws-sdk/client-s3");

module.exports = cds.service.impl ( async function(){
        xsenv.loadEnv();

        //const Messaging =  await cds.connect.to('messaging')
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // INIT - Instanciando S3                                                           //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//


        const objectstore = xsenv.readServices()['capdox-objectstore-service'];
        const bucket = objectstore.credentials.bucket;

        const s3 = new S3Client({
            region: objectstore.credentials.region,
            credentials: {
                accessKeyId: objectstore.credentials.access_key_id,
                secretAccessKey: objectstore.credentials.secret_access_key
            }
        });




        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh -  FUNCTION CONTENT - Post Image Content                                 //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('postImageContent', async (req) => {
            return await crud.postImageContentRest(req, s3, bucket);   
           
        
        });
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh - Create - Valida se o EAN já existe                                    //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.before('CREATE', ['Cnh'], async (req) => {
            return await validation.CnhCreate(req);
        });
  
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh - Create - Obtém o Content e faz a criação                              //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('CREATE', ['Cnh'], async (req, next) => {
            if (req.data.imageContent) {
                return await crud.CnhCreate(req, s3, bucket)
            } else {
                return next();
            }
        }); 
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh - READ -  Obtém o stream                         //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('READ', ['Cnh'], async (req, next) => {
            if (req.data.ID && req.query._streaming) {     
                return await crud.CnhReadStream(req.data.ID, s3, bucket)          
            } else {
                return next()
            }
        });
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh - READ - Obtém o url                            //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.after('READ', ['Cnh'], (each, req) => {
            if (!req.query._streaming) {
                crud.CnhRead(each, s3, bucket);
            }
        });
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh - UPDATE - Verifica se o EAN existe e é diferente do produto atual      //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.before('UPDATE', ['Cnh'], async (req) => {  
            return await validation.CnhUpdate(req);  
        });

        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh - UPDATE - Verifica conteúdo                                            //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('UPDATE', ['Cnh'], async (req, next) => {
            if (req.data.imageContent) {
                await crud.CnhCreate(req, s3, bucket)
                this.emit('cnhImageUpdated', { ID: req.data.ID, imageType:  req._.req.headers['content-type'] })
            } else {
                return next();
            }
        });

        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh - DELETE - Elimina conteúdo                                            //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.before('DELETE', ['Cnh'], async (req) => {
           
            await validation.CnhDelete(req);

            return await crud.CnhDelete(req, s3, bucket);
            
        });
     
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh - Evento - Imagem carregada                                                  //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on ('cnhImageUpdated', (msg) => {
            const { ID, imageType } = msg.data;
    
            UPDATE(`Cnh`,ID).with({
                imageType: imageType
            });
        })
        //return super.init();
    })

//module.exports = { CatalogService };
