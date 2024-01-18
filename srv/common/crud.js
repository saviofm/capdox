const cds = require('@sap/cds');
const { GetObjectCommand , PutObjectCommand, DeleteObjectCommand} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { Upload } = require('@aws-sdk/lib-storage');

async function CnhRead(each, s3, bucket) {
    if (each?.imageType) {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: each.ID
        });

        try {
            each.imageUrl =  await getSignedUrl(s3, command, { expiresIn: 3600 });
        } catch (error) {
            
        }
    }
};
async function CnhReadStream(ID, s3, bucket) {
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
        //return  S3Item.Body.transformToWebStream();
    } catch (error) {
        
    }
};

async function CnhCreate(req, s3, bucket){
    //const tx = cds.transaction(req);
    //const msg = cds.connect.to('messaging')

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

    //req.data.imageContent = null;
    try {
        
    await upload.done();
    //Evento atualizar imagem


    } catch (error) {
      console.log(error);
      throw(error);
    }
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

async function CnhDeleteRest(req, s3, bucket){

    const tx = cds.transaction(req);

    //Somente faz alteração caso tenha o ID
    let delObject =  await cds.run(req.query);
    if (delObject.length > 0 && delObject[0].imageType){              
        const params = {
            Bucket: bucket,
            Key: delObject[0].ID
        };
        const s3Object = await s3.deleteObject(params).promise();
        return await tx.update(cds.services.CatalogService.entities.Cnh)
            .set({imageType: null})
            .where({ID: delObject[0].ID});
    }
};


async function imageContentRest(req, s3, bucket) {
    let oCnh = await cds.run(req.query);
    if (oCnh.length > 0) {
        oCnh = oCnh[0];
                   
            const params = {
                Bucket: bucket,
                Key: oCnh.ID
            };
            
            const object = await s3.getObject(params).promise();
            req.res.contentType(oCnh.imageType);
        
            return object.Body;

        //}
    } else {
        req.error(410, "not found");
    }
    
};

async function postImageContentRest(req, s3, bucket) {
    const tx = cds.transaction(req);

    let Object =  await tx.read(cds.services.CatalogService.entities.Cnh, ['ID'])
        .where({ID: req.data.ID});;
    if (Object.length === 0) {
        req.error(410, "not found");
    }
    // separate out the mime component
    let contentType = req.data.contentURL.split(',')[0].split(':')[1].split(';')[0]
    let contentEncoding = req.data.contentURL.split(',')[0].split(':')[1].split(';')[1]
    let data = req.data.contentURL.split(',')[1]; 
    let buf = Buffer.from(data,contentEncoding);


    const params = {
        Bucket: bucket,
        Key: req.data.ID,
        Body: buf,
        ContentType: contentType,
        //ContentEncoding: contentEncoding
    };
   
    try {
        
   
    const data = await s3.upload(params).promise();

    return tx.update(cds.entities.Cnh)
        .set({
            imageType: contentType,
        })
        .where({
            ID: req.data.ID
        });
    } catch (error) {
      console.log(error);
    }
}



module.exports = {
    CnhRead,
    CnhReadStream,
    CnhCreate,
    CnhUpdate,
    CnhDelete,
    CnhDeleteRest,
    imageContentRest,
    postImageContentRest
}