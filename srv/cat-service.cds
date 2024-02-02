using capdox as capdox from '../db/data-model';

service CatalogService {
 

    //Without Draft
    entity Cnh as projection on capdox.Cnh {
        *,
        null as imageUrl  : String @Core.IsURL @Core.MediaType: imageType,
        null as imgUrl: String ,
    };
    
    type CnhType {
        imageContent: LargeBinary @Core.MediaType: imagetype;
        imagetype: String
    };   
    
    action uploadcnh(BlobUrl: String) returns {};

    
    annotate Cnh with {
    imageUrl @(
        title       : '{i18n>imageUrl}',
        description : '{i18n>imageUrl}',
        
      );
    };


}
