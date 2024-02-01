const FormData = require('form-data');
const { Readable } = require('stream');
const cds = require('@sap/cds');
const { serviceCall } = require('./destination-service');
const { update } = require('@sap/cds/libx/_runtime/hana/execute');
const { Console } = require('console');
const { GetObjectCommand , PutObjectCommand, DeleteObjectCommand} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { Upload } = require('@aws-sdk/lib-storage');

function CnhRead(each, bucket) {

};

async function CnhCreate(req,  bucket){

};

async function CnhUpdate(req){
    
};

async function CnhDelete(req, s3, bucket){
    const tx = cds.transaction(req);
    //Somente faz alteração caso tenha o ID
    if (req.data.ID) {
        let delObject =  await tx.read(cds.services.CatalogService.entities.Cnh, ['imageType'])
            .where({ID: req.data.ID});
        if (delObject.length > 0 && delObject[0].imageType){              
            const command = new DeleteObjectCommand({
                Bucket: bucket,
                Key: req.data.ID
            });
            await s3.send(command);
            try {
                const response = await s3.send(command); 
            } catch (err) {
                console.log(err);
            }
        

            if (req.data.imageContent !== undefined && req.data.imageContent === null) {
                return await tx.update(cds.services.CatalogService.entities.Cnh)
                    .set({imageType: null})
                    .where({ID: req.data.ID});
            }
        }
    }
};
 


async function CnhCreateS3(req,s3,bucket){
    const tx = cds.transaction(req);
    const contentType = req._.req.headers['content-type']
    const upload = new Upload({
        client: s3,
        params: {
            Bucket: bucket,
            Key: req.data.ID,
            Body: req.data.imageContent,
            ContentType: contentType
        }
    });

        const oCnh = await tx.run(SELECT.one().from(cds.entities.Cnh).where({ID:req.data.ID}));
        if (oCnh === null)  throw new Error(`ID ${req.data.ID} not found`);

        try {
        await upload.done();
        //Evento atualizar imagem
        

        oCnh.imageContent = req.data.imageContent;
        oCnh.imageType = contentType

        await tx.update(cds.entities.Cnh)
            .set({
                imageType: contentType,
            })
            .where({
                ID: req.data.ID
            });
        
        return oCnh;
       
    } catch (error) {
      console.log(error);
      throw(error);
    }
};

async function CnhGetUpUrl(req, s3, bucket) {

    const service = cds.services.CatalogService;
    const tx = service.tx();
    //Faz criação via serviço
    oCnh = await tx.create(service.entities.Cnh).entries({ });
    
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: oCnh.ID
    });
    try {         
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 }, (err,url)=>  url );
        //Atualiza direto na entidade o imagetype
        await tx.update(cds.entities.Cnh)
        .set({
            imageType: req.data.imagetype,
        })
        .where({
            ID: oCnh.ID
        });
        await tx.commit();
        return { url: url,
                 ID: oCnh.ID};
    } catch (error) {            
    }
};



async function CnhReadS3Url(each, s3, bucket) {
    if (each?.imageType) {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: each.ID
        });
        try {         
           const url = await getSignedUrl(s3, command, { expiresIn: 3600 }, (err,url)=>  url );
           return url;
        } catch (error) {            
        }
    }
};

async function CnhReadS3Stream(ID, s3, bucket) {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: ID
    });

    try {

        const S3Item = await s3.send(command);

        const WebStream = Readable.from(await S3Item.Body.transformToWebStream());
     
        return {
            value: WebStream
        };
   
    } catch (error) {
       throw(error) 
    }
};

async function CnhDeleteRest(req, bucket){

    const tx = cds.transaction(req);

    //Somente faz eliminaçao caso tenha o ID
    let delObject =  await cds.run(req.query);
    if (delObject.length > 0 && delObject[0].imageType){  

        const params = {
            Bucket: bucket,
            Key: delObject[0].ID
        };
        const s3Object = await s3.deleteObject(params).promise();

       
        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: req.data.ID
        });
        await s3.send(command);
        try {
            const response = await s3.send(command); 
        } catch (err) {
            console.log(err);
        }

        return await tx.update(cds.services.CatalogService.entities.Cnh)
            .set({imageType: null})
            .where({ID: delObject[0].ID});
    }
    
};

async function imageContentRest(req, s3, bucket) {
    let oCnh = await cds.run(req.query);
    if (oCnh.length > 0) {
        oCnh = oCnh[0];
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: ID
        });
    
        try {
    
            const S3Item = await s3.send(command);
     
            return S3Item.Body
       
        } catch (error) {
           throw(error) 
        }          
    } else {
        req.error(410, "not found");
    }
    
};

async function postImageContentRest(req,s3, bucket) {
    const tx = cds.transaction(req);
    const oCnh = await tx.run(SELECT.one().from(cds.entities.Cnh).where({ID:req.data.ID}));
    if (oCnh === null)  throw new Error(`ID ${req.data.ID} not found`);


     // separate out the mime component
     let contentType = req.data.contentURL.split(',')[0].split(':')[1].split(';')[0]
     let contentEncoding = req.data.contentURL.split(',')[0].split(':')[1].split(';')[1]
     let data = req.data.contentURL.split(',')[1]; 
     let buf = Buffer.from(data,contentEncoding);

     const upload = new Upload({
        client: s3,
        params: {
            Bucket: bucket,
            Key: req.data.ID,
            Body: buf,
            ContentType: contentType
        }
    });

    try {
        await upload.done();
        //Evento atualizar imagem
        

        oCnh.imageContent = req.data.imageContent;
        oCnh.imageType = contentType

        await tx.update(cds.entities.Cnh)
            .set({
                imageType: contentType,
            })
            .where({
                ID: req.data.ID
            });
        
        return oCnh;
       
    } catch (error) {
      console.log(error);
      throw(error);
    }
}


async function doxUpload(ID, s3, bucket) {

    const tx = cds.tx();
    const formData = new FormData();
    const { Cnh } = cds.entities
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: ID
    });
    let currentDate = new Date();
    const { imageType} = await tx.run(SELECT.one('imageContent','imageType').from(Cnh).where({ID:ID}));
    
    const S3Item = await s3.send(command);

    const WebStream = Readable.from(await S3Item.Body.transformToWebStream());
     

    
    
    
   
     
    const oOptions = {
       clientId: "default",
       documentType: "custom",
       receivedDate: currentDate.toISOString().split("T")[0],
       schemaId: "a478d00c-e4df-4145-a301-6b5d7bd8d2f5",
       templateId: "4a067ddb-bbca-44ec-ab7c-cbc00caedd48",
       enrichment: { } 

    }
    formData.append("options", JSON.stringify(oOptions));
    formData.append('file', WebStream, 'cnhfile_'+ ID + '.' + imageType.split('/')[1]);
    
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


module.exports = {
    CnhRead,
    CnhReadS3Url,
    CnhReadS3Stream,
    CnhCreate,
    CnhCreateS3,
    CnhGetUpUrl,
    CnhUpdate,
    CnhDelete,
    CnhDeleteRest,
    imageContentRest,
    postImageContentRest,
    doxUpload,
    doxReturn
 
}