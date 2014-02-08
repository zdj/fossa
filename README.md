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

 - **Integration Tests**

	  Your application may depend on external REST services that are unaccessible in the development environment. You are already mocking the service interface in your unit tests, but you want to add some integration tests that mimic the production environment as much as possible. ***fossa*** allows you to easily provide a REST API that can respond the way your application would expect.

 - **Demos**

	  What if you have reached the end of a development sprint and management is requesting a demo, but the REST api or messaging interface your app depends on has not yet been implemented? ***fossa*** can fill this void so that you don't have to build in placeholder logic that you will end up removing.

	  ***fossa*** also can be used to easily script certain aspects of a demo. For example, say that your application process messages delivered on a message queue. You can easily provide a browser-accessible REST service that can send a message to the queue, minimizing the time during a demo that would be wasted switching between the browser and a terminal.

 - **REST instead of SSH for executing remote tasks**

	  How often have you logged into a remote system via SSH just to run a database cleanup script or redeploy an application? Just about anything you can do with a nodejs script can easily be made available via REST and through an internet browser.

Features
-----

- **Several built-in service types**

  - echo
  - http
  - logger
  - match
  - redirect
  - service
  - AMQP services
  
- **API key authentication**

  - API key based authentication can be added to any service
  - Scripts are included for generating key agreements and testing secured services
  
- **Easy creation of custom service types**

  - Adding a new service is as easy as dropping a new file in a directory, and a little knowledge of nodejs and javascript
  
- **Multiple configuration files**
  - Organize and separate services with multiple service configuration files
  - Automatic detection of new configuration files

- **HTTP GET, POST, PUT and DELETE support**

- **Multiple configurations of each service type**

  - Service configuration files are implemented in a easy-to-read JSON format

Adding Custom Services
----------------------

Consider the following example of a new service implementation:

***lib/services/my_custom_service.js***

	var get = function(req, res, params, cb) {
		res.set('Content-Type', params['contentType']);
    	cb(req, res, params['responseText'], params['statusCode']);
	};

	exports.get = get;
	exports.post = get;
	exports.delete = get;
	exports.put = get;

The JSON configuration block for this service might be as follows:

	...
	{
        "name": "My custom service",
        "description": "An example of a custom service",
        "type": "my_custom_service",
        "GET": {
            "path": "/my_custom_service/hello",
            "params": {
				  "response": "Hello!",
				  "contentType": "text/plain",
				  "statusCode": 200
            }
        },
        "GET": {
		     "path": "/my_custom_service/goodbye",
            "params": {
				  "response": {
					  "message": "Goodbye!"
				  },
				  "contentType": "application/json",
				  "statusCode": 200
            }
        },
        "POST": {
		     "path": "/my_custom_service/hello",
            "params": {
				  "response": "Bad request!",
				  "contentType": "text/plain",
				  "statusCode": 400
            }
        }
    }
	...

In the above example, the new service is names 'my_custom_service' and the javascript file for this service would be saved in `lib/services/my_custom_Service.js`. The 'type' specified in the service's configuration must always match the root filename.

If running on http://localhost:3000, this new service would issue the following responses to its corresponding HTTP calls:

	Request: http method: GET, url: http://localhost:3000/my_custom_service/hello

	Response: status: 200, response body: Hello!, content-type: text/plain
  

	Request: http method: GET, url: http://localhost:3000/my_custom_service/goodbye

	Response: status: 200, response body: {"message":"Goodbye!"}, content-type: application/json
	
	
	Request: http method: POST, url: http://localhost:3000/my_custom_service/hello

	Response: status: 400, response body: Bad Request!, content-type: text/plain


The schema for a service conjuration file is as follows:

`TODO: Create a schema!`

	{
		"title": "Fossa configuration file",
		"type": "object",
		"properties": {
			"firstName": {
				"type": "string"
			},
			"lastName": {
				"type": "string"
			},
			"age": {
				"description": "Age in years",
				"type": "integer",
				"minimum": 0
			}
		},
		"required": ["firstName", "lastName"]
	}

