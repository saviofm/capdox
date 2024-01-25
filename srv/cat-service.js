const cds = require('@sap/cds');
const validation = require('./common/validation')
const crud = require('./common/crud')
const xsenv = require("@sap/xsenv");



class CatalogService extends cds.ApplicationService {
    init() {
        
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // INIT - Instanciando S3                                                           //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//

        xsenv.loadEnv();


        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh - Create - Valida se o EAN já existe                                         //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.before('CREATE', ['Cnh'], async (req) => {
            return await validation.CnhCreate(req);
        });
  
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh - Create - Obtém o Content e faz a criação                                    //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('CREATE', ['Cnh'], async (req, next) => {
            /*if (req.data.imageContent) {
                return await crud.CnhCreate(req)
            } else {
                
            }
            */

            return next();
        }); 
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh - Create - Inicia o DOX                                                      //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.after('CREATE', ['Cnh'], async (Cnh) => {
            /*if (req.data.imageContent) {
                return await crud.CnhCreate(req)
            } else {
                
            }
            */

           
        }); 
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh - READ -  Obtém o stream                         //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('READ', ['Cnh'], (req, next) => {
            /*
            if (req.data.ID && req.query._streaming) {            
            
            } else {
                
            }
            */
            return next()
        });
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh - READ - Obtém o url                            //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.after('READ', ['Cnh'], (each, req) => {
            /*
            if (!req.query._streaming) {
                crud.CnhRead(each);
            }
            */
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
            /*
            if (req.data.imageContent) {
                return await crud.CnhCreate(req)
            } else {
             
            }
            */
            return next();
        });
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh - UPDATE - Verifica conteúdo                                            //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.after('UPDATE', ['Cnh'], async (Cnh) => {
            /*
            if (req.data.imageContent) {
                return await crud.CnhCreate(req)
            } else {
             
            }
            */
            if (Cnh.imageContent) {

                    this.emit('postDOXData' , Cnh.ID );
     
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
        /*
            return await crud.CnhDelete(req);
        */   
        });
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh - UPDATE - Verifica conteúdo                                            //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('DELETE', ['Cnh'], async (req, next) => {
            /*
            if (req.data.imageContent) {
                return await crud.CnhCreate(req)
            } else {
             
            }
            */
            return next();
        });
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh - EVENT - Return DOX Data                           //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('postDOXData', async (msg) => {
                //Call DOX
                const idEvent = await crud.doxUpload(msg.data);
                if (idEvent) {
                    this.emit('returnDOXData' , idEvent );
                }  
            
        });

        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Cnh - EVENT - Return DOX Data                           //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('returnDOXData', async (msg) => {
            for (let i = 0; i < msg.data.Retry; i++) {
                await new Promise(resolve => setTimeout(resolve, 30000));
                const ok = await crud.doxReturn(msg.data);
                
                if (ok){
                    break;
                }
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
            return await crud.postImageContentRest(req);   
           
        
        });
        return super.init();
    }
}

module.exports = { CatalogService };
