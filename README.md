fossa
=====

Installation
------------

	npm install fossa
	
About
-----
	
***fossa*** is a integration and test utility for application development. The goal of this package is to provide a convenient, easy-to-configure and easy-to-use utility for simulating external events and services.

Use Case Examples
-----

* **Integration Tests**

  Your application may depend on external REST services that are unaccessible in the development environment. You are already mocking the service interface in your unit tests, but you want to add some integration tests that mimic the production environment as much as possible. ***fossa*** allows you to easily provide a REST API that can respond the way your application would expect.
  
* **Demos**

  What if you have reached the end of a development sprint and management is requesting a demo, but the REST api or messaging interface your app depends on has not yet been implemented? ***fossa*** can fill this void so that you don't have to build in placeholder logic that you will end up removing.
  
  ***fossa*** also can be used to easily script certain aspects of a demo. For example, say that your application process messages delivered on a message queue. You can easily provide a browser-accessible REST service that can send a message to the queue, minimizing the time during a demo that would be wasted switching between the browser and a terminal.
  
* **REST instead of SSH**

  How often have you logged into a remote system via SSH just to run a database cleanup script or redeploy an application? Just about anything you can do with a nodejs script can easily be made available via REST and through an internet browser. 
   
Features
-----

* Several built-in REST *service types*
  * 

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