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
	 Context Path: /ok
	          GET: http  [404,"Not Found"]
	         POST: http  [200,"OK"]
	       DELETE: http  [404,"Not Found"]
	          PUT: http  [404,"Not Found"]

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
	          GET: redirect  ["http://google.com"]
	         POST: redirect  ["http://google.com"]
	       DELETE: redirect  ["http://google.com"]
	          PUT: redirect  ["http://google.com"]

**lib/config.js** 

	{
    	"services": [
        	{
            	"name": "Simple HTTP listener",
				"description" : "Returns the supplied status code and response message",
            	"path": "/ok",
	            "GET": {
    	            "type": "http",
        	        "params": [404,"Not Found"]
            	},
	            "POST": {
	                "type": "http",
	                "params": [200,"OK"]
	            },
	            "PUT": {
	                "type": "http",
	                "params": [404,"Not Found"]
	            },
	            "DELETE": {
	                "type": "http",
	                "params": [404,"Not Found"]
	            }
	        },
	        {
	            "name": "Simple ECHO HTTP listener",
				"description" : "Echoes the request body 	for POST/PUT, and the requested URL for GET/DELETE",
	            "path": "/echo",
	            "ALL": {
	                "type": "echo"
	            }
	        },
	        {
	            "name": "Simple Redirect HTTP listener",
				"description" : "Redirects the caller to the supplied URL",
	            "path": "/redirect",
	            "ALL": {
	                "type": "redirect",
					"params" : ["http://google.com"]
	            }
	        }
	    ]
	}
	
Adding Custom Services
----------------------

Custom 'services' can be installed by creating or dropping in new javascript files in the `lib/services` directory that ahere to the following specification:

  * HTTP GET, POST, PUT or DELETE services specified in `lib/config.js` must have a corresponding function exported where the function's name is the lowercase HTTP verb (*for HTTP GET, the function name would be 'get'*).
  * The function must have the following signature:
  		
  		function(req, res, cb)

  * The callback provided to this function does not need to be called, but if called, it should be called like the following:
  
  		cb(req,res,responseMessage, statusCode);
  		
  	where the *responseMessage* is 	the data to be included in the response body, and the *statusCode* is the HTTP status code to be returned with the response.

  * If calling the supplied callback, it is expected fossa will reply with it's standard response, and your 'service' should not attempt to send the response itself. Fossa will set the response's *Content-Type* to that of the incoming request, or to *plain/text*