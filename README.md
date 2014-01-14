fossa
=====

Installation
------------

	npm install fossa
	
About
-----
	
An integration testing and scripting utility.

The aim of this package is to provide a convenient, easy-to-configure and easy-to-use utility for simulating external events and services.

**Use Cases**

Your application depends on REST services hosted on a server that is unaccessible in the development environment. You have already mocked the serviceapi_key_test.js interface in your unit tests, but you want to write some integration tests that mimic the production environment as much as possible. Fossa allows you to easily configure and launch a REST API that can issue responses that your application would expect.

Say you want to demo your progress to the client or management, but the REST api or messaging interface your app requires has not yet been implemented. Fossa can fill this void so that you don't have to build in placeholder logic that you will end up removing.

Default Configuration
---------------------

The default configuration is preconfigured with some examples for reference.

Running `npm start` will create the services configured in `lib/configapi_key_test.js`. The predefined services included in this build are located in `lib/services`.

**Service Types**

The following services are included in this build:

*Basic Services Types*

* http
* echo
* match
* redirect

*AMQP Helper Services*

* amqp_user
* amqp_vhost
* amqp_vhost_user
* amqp_exchange
* amqp_queue
* amqp_bind
* amqp_publish

For a detailed description of each serviceapi_key_test.js, including configuration examples, please see the section ***Service Configuration***.

Adding Custom Services
----------------------

Custom 'services' can be installed by creating or dropping in new javascript files in `lib/services`, and should adhere to the following specification:

  * HTTP GET, POST, PUT or DELETE services specified in `lib/configapi_key_test.js` must have a corresponding function exported where the function's name is the lowercase HTTP verb *(for HTTP GET, the function name would be 'get')*.
  
  * The function must have the following signature:
  		
  		function(req, res, params, cb)

  * The callback provided to this function does not need to be called, but if called, it should be called like the following:
  
  		cb(req, res, responseMessage, statusCode);
  		
  	where the *responseMessage* is 	the data to be included in the response body, and the *statusCode* is the HTTP status code to be returned with the response.

  * If calling the supplied callback, it is expected fossa will reply with it's standard response, and your 'serviceapi_key_test.js' should not attempt to send the response itself.
  
  * Where file file based responses are allowed, response files should go in `lib/files`.
  
Service Configuration
---------------------

***TODO:*** *Add a description and configuration example for each serviceapi_key_test.js type.*