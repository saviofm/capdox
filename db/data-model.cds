using {
  cuid,
  managed
} from '@sap/cds/common';


namespace capdox;

//----------------------- PRODUCTS  ---------------------//
//------------------------------------------------------//
//------------------------------------------------------//
//Entity
entity Cnh : cuid , managed {
      numeroRegistro : String;
      nome : localized String;
      cpf : String;
      docIdentidade: LargeString;
      dataEmissao :  Date;
      dataValidade : Date;
      imageContent: LargeBinary @Core.MediaType: imageType;
      imageType : String @Core.IsMediaType: true; 
      obs: LargeString;
}


@cds.odata.valuelist
//Annotation
annotate Cnh with @(
  title              : '{i18n>Cnh}',
  description        : '{i18n>Cnh}',
  UI.TextArrangement : #TextOnly,
  Common.SemanticKey : [numeroRegistro],
  UI.Identification  : [{
    $Type : 'UI.DataField',
    Value : numeroRegistro
  }]
) {
  ID @(
        Core.Computed,
        Common.Text : {
            $value                 : numeroRegistro,
            ![@UI.TextArrangement] : #TextOnly
        }
  );
  numeroRegistro            @(
    title       : '{i18n>numeroRegistro}',
    description : '{i18n>numeroRegistro}',
    Common      : {
        FieldControl             : #Mandatory,
    //  Text : {
    //    $value                 : productDescription,
    //    ![@UI.TextArrangement] : #TextLast
    //  }
    }
  );
  nome @(
    title       : '{i18n>nome}',
    description : '{i18n>nome}',
    Common      : {
      FieldControl : #Mandatory,
      TextFor      : numeroRegistro
    }
  );
  cpf @(
    title       : '{i18n>cpf}',
    description : '{i18n>cpf}',
  );
  docIdentidade @(
    title       : '{i18n>docIdentidade}',
    description : '{i18n>docIdentidade}',
  );
  dataEmissao @(
    title       : '{i18n>dataEmissao}',
    description : '{i18n>dataEmissao}',
  );
  dataValidade @(
    title       : '{i18n>dataValidade}',
    description : '{i18n>dataValidade}',
  );
  obs @(
    title       : '{i18n>obs}',
    description : '{i18n>obs}',
  )
};
