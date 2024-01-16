using capdox as capdox from '../db/data-model';

service CatalogService {
 

    //Without Draft
    entity Cnh as projection on capdox.Cnh {
        *,
        null as imageUrl  : String  @Core.MediaType: imageType, 
    };



    action postImageContent (ID: UUID, contentURL:LargeString);


    annotate Cnh with {
    imageUrl @(
        title       : '{i18n>imageUrl}',
        description : '{i18n>imageUrl}',
      );
    };

}




