const fetch = require('node-fetch');
const xsenv = require('@sap/xsenv');


let service = null;
//Service
async function serviceCall(method, returnType, name, path, headers, body) {
  
  xsenv.loadEnv();
  console.log('UPLOAD DMS - STEP 1 folder')
  console.log('UPLOAD DMS - STEP 1 folder')

  console.log('UPLOAD DMS - STEP 1 - total services: '+JSON.stringify(xsenv.readServices()))
  console.log('UPLOAD DMS - STEP 1 - service to get: '+ name)
  service = xsenv.readServices()[name];
  const serviceUrl = await getDestinationUrlService(service);
  const jwtToken = await getJWTTokenService();
  
  let basicAuthorization = `Bearer ${jwtToken}`;
  if (!headers) {
    headers = new fetch.Headers({
      "Authorization" : basicAuthorization,
      "Accept": "application/json"
    });  
  } else {
    headers.set("Authorization", basicAuthorization);
  }
  console.log('UPLOAD DMS - STEP 2 - call '+JSON.stringify(service))
 
  const response = await fetch(serviceUrl + path, { method: method, headers: headers, body: body })

  const responseTypped = await response[returnType]();
  return responseTypped;

  
}


async function getDestinationUrlService(service) {
  if (service.credentials.url) {
    return service.credentials.url;
  } else if (service.credentials.uri) {
    return service.credentials.uri;
  }
}
async function getJWTTokenService() {
  const credentials = service.credentials;
  const clientId = credentials.uaa.clientid;
  const secret = credentials.uaa.clientsecret;
  const authUrl = credentials.uaa.url;
  //const headers = fetch.headers();
  let authorization = `Basic ${Buffer.from(clientId + ':' + secret).toString("base64")}`;
  const headers = {
    "Authorization": authorization
  };
  let url = authUrl + '/oauth/token?grant_type=client_credentials&response_type=token';
  const result =  await fetch(url, { method: 'GET', headers: headers }).then(async (res)=>{
    return await  res.json()
  });
  return result.access_token;
}


//Other calls
async function otherServiceCall(name, path, method, headers, body) {
  xsenv.loadEnv();
  const serviceUrl = await getDestinationUrl(name);
  const jwtToken = await getJWTToken('sapxpsp-xsuaa-service');
  if (!headers) {
    headers = new fetch.Headers({
      'Content-Type': 'application/json'
    });
  }
  let basicAuthorization = `Bearer ${jwtToken}`;
  headers.set("Authorization", basicAuthorization);

  if (method == 'GET'){
    const response = await fetch(serviceUrl + path, { method: 'GET', headers: headers })
    return await response.json()
  };

  if (method == 'POST') {
    const response = await fetch(serviceUrl + path, { method: 'POST', headers: headers, body })
    return await response.text()
  }
}


async function getDestinationUrl(name) {
  const destinationServiceName = 'sapxpsp-destination-service'
  var jwt = await getJWTToken(destinationServiceName);
  const host = xsenv.getServices({ tag: destinationServiceName }).tag.uri
  const headers = new fetch.Headers();
  let basicAuthorization = `Bearer ${jwt}`;
  headers.set("Authorization", basicAuthorization);
  const url = host + '/destination-configuration/v1/destinations/' + name
  const response = await fetch(url, { method: 'GET', headers: headers })
  const data = await response.json();
  return data.destinationConfiguration.URL;
}



async function getJWTToken(serviceName) {
  const serviceGetToken = xsenv.readServices()[serviceName];
  const credentials = serviceGetToken.credentials;
  const clientId = credentials.clientid;
  const secret = credentials.clientsecret;
  const authUrl = credentials.url;
  const headers = new fetch.Headers();
  let authorization = `Basic ${Buffer.from(clientId + ':' + secret).toString("base64")}`;
  headers.set("Authorization", authorization);
  let url = authUrl + '/oauth/token?grant_type=client_credentials&response_type=token';
  const result = await fetch(url, { method: 'GET', headers: headers }).then((res)=>{
    return res.json()
  });
  return result.access_token;
}

module.exports = {
  otherServiceCall  : otherServiceCall,
  serviceCall : serviceCall,
  getJWTToken : getJWTToken,
  getDestinationUrl : getDestinationUrl
}
