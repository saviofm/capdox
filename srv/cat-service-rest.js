const cds = require('@sap/cds');
const validation = require('./common/validation')
const crud = require('./common/crud')
const xsenv = require("@sap/xsenv");
const {  S3Client } = require("@aws-sdk/client-s3");





class CatalogRest extends cds.ApplicationService {
    init() {

        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // INIT - Instanciando S3                                                           //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//

        xsenv.loadEnv();
        const objectstore = xsenv.readServices()['capdox-objectstore-service'];
        const bucket = objectstore.credentials.bucket;

        const s3 = new S3Client({
            region: objectstore.credentials.region,
            credentials: {
                accessKeyId: objectstore.credentials.access_key_id,
                secretAccessKey: objectstore.credentials.secret_access_key
            }
        });


        /*
        const credentials = new AWS.Credentials(
            objectstore.credentials.access_key_id,
            objectstore.credentials.secret_access_key
        );

        AWS.config.update({
            region: objectstore.credentials.region,
            credentials: credentials

        })
        const s3 = new AWS.S3({
            apiVersion: '2006-03-01'
        })
        */ 
         //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh - Create - Valida se o EAN já existe                                    //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.before('CREATE', 'Cnh', async (req) => {
            return await validation.CnhCreate(req);  
        });

        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh - Create - Obtém o Content e faz a criação                              //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('CREATE', 'Cnh', async (req, next) => {
            if (req.data.imageContent) {
                 await crud.CnhCreate(req, s3, bucket);
                 
            } else {
                return next();
            }
        }); 
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh - READ - Obtém o Content como stream e o url                            //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.after('READ', 'Cnh', (each, req) => {
            if (!req.headers['content-type'] || !req.headers['content-type'] === 'application/octet-stream') {
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
        this.before('UPDATE', 'Cnh', async (req) => {
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
                return await crud.CnhCreate(req, s3, bucket)
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
        // Cnh -  FUNCTION CONTENT - get Image Content                                 //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('imageContent', 'Cnh', async (req) => {
            return await crud.imageContentRest(req, s3, bucket);   
        });
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh -  FUNCTION CONTENT - DELETE Image Content                              //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('deleteImageContent', 'Cnh', async (req) => {            
            return crud.CnhDeleteRest(req, s3, bucket); 
              
        });

        return super.init();
    }
}

module.exports = { CatalogRest };
