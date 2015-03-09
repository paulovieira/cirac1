var _ = require('underscore');
var Hoek = require('hoek');
var Path = require('path');
var fs = require("fs");
var cheerio = require('cheerio');
var ent = require("ent");

var rootPath = Path.normalize(__dirname + "/../..");

module.exports = {

    // apply _.extend to all the objects in the given array
    extend: function(arrayOfObjs, sourceObj) {
        for (var i = 0, l = arrayOfObjs.length; i < l; i++) {
            _.extend(arrayOfObjs[i], sourceObj);
        }
    },

    // return the correct html filename (in server/views) associated with the "param1/param2" parameters 
    // (the typical url will be "/{lang}/{page1}/{page2}" )
    getView: function(param1, param2) {

        var htmlFile = "";
        var recognizedRoutes = [
            {
                param1: "",
                param2: ""
            },

            // ----------------------
            
            {
                param1: "introducao",
                param2: "mensagem"
            },
            {
                param1: "introducao",
                param2: "metodologia"
            },
            {
                param1: "introducao",
                param2: "equipa"
            },

            // ----------------------
            
            {
                param1: "sumario-executivo",
                param2: ""
            },

            // ----------------------
            
            {
                param1: "sectores",
                param2: "saude"
            },
            {
                param1: "sectores",
                param2: "turismo"
            },
            {
                param1: "sectores",
                param2: "energia"
            },
            {
                param1: "sectores",
                param2: "biodiversidade"
            },
            {
                param1: "sectores",
                param2: "recursos-hidricos"
            },
            {
                param1: "sectores",
                param2: "recursos-hidricos"
            },
            {
                param1: "sectores",
                param2: "agricultura-florestas"
            },
            {
                param1: "sectores",
                param2: "agricultura-florestas-2"
            },

            // ----------------------
            
            {
                param1: "cartografia",
                param2: ""
            },

            // ----------------------
            
            {
                param1: "estrategia-adaptacao",
                param2: ""
            }

        ];

        var route = _.findWhere(recognizedRoutes, {param1: param1, param2: param2});

        if(route){
            htmlFile = (route.param1 + (route.param2 ? "/" + route.param2 : "")) || "home";
        }

        return htmlFile;
    },


    // call Hoek.transform in all objects of an array (of objects)
    transform: function(array, transform, options) {
        if (!_.isArray(array)) {
            array = [array];
        }

        var i, li;
        for (i = 0, li = array.length; i < li; i++) {
            array[i] = Hoek.transform(array[i], transform, options);
        }

        return array;
    },

    // given an obj or array of objectsm and list of strings (keys), deletes those properties from all objects
    // usage: utils.deleteProps(myObj, "name", "age")
    deleteProps: function(array) {
        var args = Array.prototype.slice.call(arguments);
        if (!_.isArray(array)) {
            array = [array];
        }

        var key, i, j, li, lj;

        for (i = 1, li = args.length; i < li; i++) {
            key = args[i];
            for (j = 0, lj = array.length; j < lj; j++) {

                // array[j] is an object
                delete(array[j])[key];
            }
        }

        return array;
    },

    // given an obj or array of objects, a key (string) and assuming obj.key is an object, flattens the properties 
    // in obj.key; 
    // that is, we will have obj.key.a === obj.a, obj.key.b === obj.b, etc 
    // (if obj.key.a is another object, obj.a will simply be a reference)
    flattenObj: function(array) {
        var args = Array.prototype.slice.call(arguments);
        if (!_.isArray(array)) {
            array = [array];
        }

        var key, i, j, li, lj;

        function flattenObj(obj, nestedObj) {
            Object.keys(nestedObj).forEach(function(nestedKey) {
                obj[nestedKey] = nestedObj[nestedKey];
            });
        }

        for (i = 1, li = args.length; i < li; i++) {
            key = args[i];
            for (j = 0, lj = array.length; j < lj; j++) {
                // array[j] is an object and we assume array[j][key] is also an object
                flattenObj(array[j], array[j][key]);
            }
        }


        /*
                Object.keys(obj[key]).forEach(function(nestedKey){
                    obj[nestedKey] = obj[key][nestedKey];
                });
        */
        return array;
    },


    logHandlerInfo: function(routeName, request) {
        console.log("handler: ".blue + routeName +
            "    " + "|".white + "    path: ".blue + request.path +
            "    " + "|".white + "    method: ".blue + request.method);
    },

    // require and call the modules where the registration of the plugins happens
    // (that is, where we have the call to server.register + any specific options)
    registerPlugins: function(server) {
        require(global.rootPath + "server/plugins/hapi-auth-cookie.js")(server);
        require(global.rootPath + "server/plugins/hapi-swagger.js")(server);
        require(global.rootPath + "server/plugins/scooter.js")(server);
//        require(global.rootPath + "server/plugins/good.js")(server);
        //		require("../plugins/tv.js")(server);
    },


    decodeImg: function(contents){
        var langKeys = Object.keys(contents),
            foundImgBase64 = false;

        for(var i=0, l=langKeys.length; i<l; i++){
            if(foundImgBase64){
                break;
            }

            var lang = langKeys[i];

            var $ = cheerio.load(contents[lang], {
                normalizeWhitespace: true,
                decodeEntities: true
            });

            $("img").each(function(){
                var src   = $(this).attr("src");
                var index = src.indexOf("base64");

                if(index !== -1){

                    var srcBase64 = src.substr(index + 7);  // +7 to include "base64,"
                    var filename = $(this).data("filename") || "img_" + Date.now() + ".jpg";
                    var filePathPhysical = "/data/uploads/public/images/" + filename;
                    var filePathLogical = "/uploads/public/images/" + filename;

                    try{

                        fs.writeFileSync(rootPath + filePathPhysical, new Buffer(srcBase64, "base64"));
                        $(this).attr("src", filePathLogical);
                        $(this).removeAttr("data-filename");

                        contents[lang] = ent.decode($.html());

                        foundImgBase64 = true;
                    }
                    catch(err){
                        throw err;
                    }
                }

            });
        }

        console.log("contents: ", contents);
    }
    /*

    	parseTextsArray: function(resp){
    		// 1. flatten each row: for each object we want to place the properties in the "contents" object
    		// directly to the main object (that is, instead of "obj.contents.pt" we want "obj.pt")
    		resp.forEach(function(obj){
    			Object.keys(obj.contents).forEach(function(key){
    				obj[key] = obj.contents[key];
    			});

    			obj.contents = null;
    		});

    		// 2. transform the array of object into an object (where the keys are given by the id value)
    		return _.indexBy(resp, "id");
    	},


    */

};
