const FormData = require('form-data');
const { Readable } = require('stream');
const cds = require('@sap/cds');
const { serviceCall } = require('./destination-service');
const { update } = require('@sap/cds/libx/_runtime/hana/execute');
const { Console } = require('console');
function CnhRead(each, bucket) {

};

async function CnhCreate(req,  bucket){

};

async function CnhUpdate(req){
    
};

async function CnhDelete(req, s3, bucket){

 
};

async function doxUpload(ID) {

    const tx = cds.tx();

    const formData = new FormData();
    const { Cnh } = cds.entities

    const { imageContent, imageType} = await tx.run(SELECT.one('imageContent','imageType').from(Cnh).where({ID:ID}));
    let currentDate = new Date();
     
    const oOptions = {
       clientId: "default",
       documentType: "custom",
       receivedDate: currentDate.toISOString().split("T")[0],
       schemaId: "a478d00c-e4df-4145-a301-6b5d7bd8d2f5",
       templateId: "4a067ddb-bbca-44ec-ab7c-cbc00caedd48",
       enrichment: { } 

    }
    formData.append("options", JSON.stringify(oOptions));
    formData.append('file',imageContent, 'cnhfile_'+ ID + '.' + imageType.split('/')[1]);
    
    console.log('ID: '+ID)
    const response = await serviceCall( 'POST', 'default_sap-document-information-extraction', '/document-information-extraction/v1/document/jobs', null, formData );
    responseOjb = JSON.parse(response)
    if (responseOjb.status = 'PENDING') {
        await tx.run(UPDATE(Cnh).set({ IDDOX : responseOjb.id, status: responseOjb.status}).where({ID:ID}));
        await tx.commit();
        console.log('IDDOX: '+ responseOjb.id)
        return { ID: ID,
                 IDDOX: responseOjb.id,
                 Retry: 3 };
       
    }
}

async function doxReturn(event) {


    const { Cnh } = cds.entities
    const tx = cds.tx();
    
    const response = await serviceCall( 'GET', 'default_sap-document-information-extraction', '/document-information-extraction/v1/document/jobs/'+event.IDDOX , null, null );
    responseObj = JSON.parse(response)
    if (responseObj.status == 'DONE') {
        let updateSet = {status : responseObj.status};
        for (const headerfield of  responseObj.extraction.headerFields){
         updateSet[headerfield.name] = headerfield.value
         if ( headerfield.name == 'cpf' ||
              headerfield.name == 'docIdentidade' ||
              headerfield.name == 'numeroRegistro'  ) {
                updateSet[headerfield.name] = updateSet[headerfield.name].replace(/\D/g, "");;
         }
        }
        await tx.run(UPDATE(Cnh).set(updateSet).where({ID:event.ID}));
        await tx.commit();
        return true;
    } 
    return false;
}



async function CnhDeleteRest(req, bucket){

    
};

async function imageContentRest(req, bucket) {
 
    
};

async function postImageContentRest(req, bucket) {
}



module.exports = {
    CnhRead,
    CnhCreate,
    CnhUpdate,
    CnhDelete,
    CnhDeleteRest,
    imageContentRest,
    postImageContentRest,
    doxUpload,
    doxReturn
 
}