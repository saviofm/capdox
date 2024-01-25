using capdox as capdox from '../db/data-model';

service CatalogService {
 

    //Without Draft
    entity Cnh as projection on capdox.Cnh {
        *
    };
    
   

    action postImageContent (content: LargeBinary) returns {};
                             

    event returnDOXDaata: {
        ID: Cnh:ID;
        IDDOX: Cnh:IDDOX;
        Retry: Integer;
    };

    event postDOXDaata: {
        ID: Cnh:ID;
    };
}