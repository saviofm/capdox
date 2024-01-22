const cds = require('@sap/cds');
const { serviceCall } = require('./destination-service');
function CnhRead(each, bucket) {
  
};

async function CnhCreate(req,  bucket){

};

async function CnhUpdate(req){
    
};

async function CnhDelete(req, s3, bucket){

 
};

async function doxUpload(Cnh) {
    const oOptions = {
            "clientId": "default",
            "documentType": "custom",
            "receivedDate":"2024-01-08",
            "schemaId": "a478d00c-e4df-4145-a301-6b5d7bd8d2f5",
            "templateId": "5da66304-c7c5-470d-af0b-87e0d136896a",
               "enrichment":{         
        }
    };
    const formData = new FormData();
    formData.append('file', Cnh.imageContent);
    formData.append('options', oOptions);



    const response = await serviceCall( 'POST', 'default_sap-document-information-extraction', '/document-information-extraction/v1/document/jobs', null, formData );
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
    doxUpload
    
}