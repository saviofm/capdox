using capdox as capdox from '../db/data-model';

service CatalogService {
 

    //Without Draft
    entity Cnh as projection on capdox.Cnh {
        *
    };


    action postImageContent (ID: UUID, contentURL:LargeString);
}