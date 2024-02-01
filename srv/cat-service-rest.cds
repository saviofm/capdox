using CatalogService as CatalogService from './cat-service';



@protocol : 'rest'
service CatalogRest {

    entity Cnh as projection on CatalogService.Cnh 
        actions {
            function imageContent() returns {};
            action deleteImageContent();
        };
    
    
    action postImageContent(ID: UUID, contentURL:LargeString);



    
}