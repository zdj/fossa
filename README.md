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

Your application depends on REST services hosted on a server that is unaccessible in the development environment. You have already mocked the service interface in your unit tests, but you want to write some integration tests that mimic the production environment as much as possible. Fossa allows you to easily configure and launch a REST API that can issue responses that your application would expect.

Say you want to demo your progress to the client or management, but the REST api or messaging interface your app requires has not yet been implemented. Fossa can fill this void so that you don't have to build in placeholder logic that you will end up removing.

Default Configuration
---------------------

The default configuration is preconfigured with some examples for reference.

Running `npm start` will create the following REST services:

	Creating service listener: Simple HTTP listener
	  Description: Returns the supplied status code and response message
	 Context Path: /http
	          GET: http
	         POST: http
	       DELETE: http
	          PUT: http

	Creating service listener: Simple ECHO HTTP listener
	  Description: Echoes the request body for POST/PUT, and the requested URL for GET/DELETE
	 Context Path: /echo
	          GET: echo
	         POST: echo
	       DELETE: echo
	          PUT: echo

	Creating service listener: Simple Redirect HTTP listener
	  Description: Redirects the caller to the supplied URL
	 Context Path: /redirect
	          GET: redirect
	         POST: redirect
	       DELETE: redirect
	          PUT: redirect

	Creating service listener: Simple RabbitMQ Message Publisher
	  Description: Publishes a message on the specified exchange
	 Context Path: /amqp/publish
	         POST: amqp_publish

**lib/config.js** 

	{
	    "services": [
	        {
	            "name": "Simple HTTP listener",
	            "description": "Returns the supplied status code and response message",
	            "path": "/http",
	            "GET": {
	                "type": "http",
	                "params": {
	                    "statusCode": 404,
	                    "responseMessage": "Not Found"
	                }
	            },
	            "POST": {
	                "type": "http",
	                "params": {
	                    "statusCode": 204
	                }
	            },
	            "PUT": {
	                "type": "http",
	                "params": {
	                    "statusCode": 200,
	                    "responseMessage": "OK"
	                }
	            },
	            "DELETE": {
	                "type": "http",
	                "params": {
	                    "statusCode": 404,
	                    "responseMessage": "Not Found"
	                }
	            }
	        },
	        {
	            "name": "Simple ECHO HTTP listener",
	            "description": "Echoes the request body for POST/PUT, and the requested URL for GET/DELETE",
	            "path": "/echo",
	            "ALL": {
	                "type": "echo"
	            }
	        },
	        {
	            "name": "Simple Redirect HTTP listener",
	            "description": "Redirects the caller to the supplied URL",
	            "path": "/redirect",
	            "ALL": {
	                "type": "redirect",
	                "params": {
	                    "url": "http://google.com"
	                }
	            }
	        },
	        {
	            "name": "Simple RabbitMQ Message Publisher",
	            "description" : "Publishes a message on the specified exchange",
	            "path": "/amqp/publish",
	            "POST": {
	                "type": "amqp_publish",
	                "params" : {
	                    "host": "127.0.0.1",
						"port": 15672,
						"user": "admin:admin",
						"vhost": "syndication",
	                    "exchange": "syndication",
	                    "routingKey": "update",
						"payload": "Hello!",
						"payloadEncoding": "string"
	                }
	            }
	        }
	    ]
	}	
	
Adding Custom Services
----------------------

Custom 'services' can be installed by creating or dropping in new javascript files in the `lib/services` directory that ahere to the following specification:

  * HTTP GET, POST, PUT or DELETE services specified in `lib/config.js` must have a corresponding function exported where the function's name is the lowercase HTTP verb **(for HTTP GET, the function name would be 'get')**.
  
  * The function must have the following signature:
  		
  		function(req, res, cb)

  * The callback provided to this function does not need to be called, but if called, it should be called like the following:
  
  		cb(req, res, responseMessage, statusCode);
  		
  	where the *responseMessage* is 	the data to be included in the response body, and the *statusCode* is the HTTP status code to be returned with the response.

  * If calling the supplied callback, it is expected fossa will reply with it's standard response, and your 'service' should not attempt to send the response itself. Fossa will set the response's *Content-Type* to that of the incoming request, or to *plain/text*