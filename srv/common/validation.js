const cds = require('@sap/cds');
const { getBundle } = require('./i18n');

async function CnhCreate(req){
    let bundle = getBundle(req.user.locale);
    const tx = cds.transaction(req);
    let numeroRegistro = req.data.numeroRegistro.replace(" ",""); 
           
    let oCnh =  await tx.read(cds.services.CatalogService.entities.Cnh, ['ID'])
                        .where(
                            { 
                                numeroRegistro: numeroRegistro
                            }
                        );

    if (oCnh.length > 0) {
        const txt = bundle.getText("mERROR_UNIQUE",[req.data.numeroRegistro, bundle.getText("mNumeroRegistro")]);
        return req.error(410, txt);
    }
};

async function CnhUpdate(req){
    let bundle = getBundle(req.user.locale);
    const tx = cds.transaction(req);
    //Validar Numero Registro
    let numeroRegistro = req.data.numeroRegistro?.replace(" ","");     
    if (numeroRegistro) {
    let oCnh =  await tx.read(cds.services.CatalogService.entities.Cnh, ['ID'])
                        .where(
                        { 
                            ID: {
                                '<>': req.data.ID
                            },
                            numeroRegistro: numeroRegistro
                        }
                    );
        if (oCnh.length > 0) {
            const txt = bundle.getText("mERROR_UNIQUE",[req.data.numeroRegistro, bundle.getText("mNumeroRegistro")]);
            return req.error(410, txt);
        }
    }

    //Validar ImageType
    if (req.data.imageType !== undefined){
        if(req.data.imageType === null){
            const txt = bundle.getText("mERROR_DELETE_FIELD", 'imageType');
            req.error(410, txt);   
        }
       //Returning old value
        let oCnh =  await tx.read(cds.services.CatalogService.entities.Cnh, ['imageType'])
                        .where({ID:  req.data.ID});
                           
        if (oCnh.length > 0 && oCnh[0].imageType){
            req.data.imageType =  oCnh[0].imageType;
        }
    }
};

async function CnhDelete(req){
    let bundle = getBundle(req.user.locale);
     //Verifica se está tentando somente apagar o imageType
     if (req.data.imageType !== undefined && req.data.imageType === null){
        const txt = bundle.getText("mERROR_DELETE_FIELD", 'imageType');
        req.error(410, txt);
    }

    const tx = cds.transaction(req);
    let numeroRegistro = req.data.numeroRegistro?.replace(" ","");
            
    if (numeroRegistro) {
    let oCnh =  await tx.read(cds.services.CatalogService.entities.Cnh, ['ID'])
                        .where(
                        { 
                            ID: {
                                '<>': req.data.ID
                            },
                            numeroRegistro: numeroRegistro
                        }
                    );
        if (oCnh.length > 0) {
            const txt = bundle.getText("mERROR_UNIQUE",[req.data.numeroRegistro, bundle.getText("mNumeroRegistro")]);
            return req.error(410, txt);
        }
    }
};

module.exports = {
    CnhCreate,
    CnhUpdate,
    CnhDelete
}