var fs = require("fs");
var Path = require('path');
var stripJsonComments = require("strip-json-comments");
var jsonFormat = require('json-format');
var _ = require('underscore');
var changeCase = require("change-case-keys");

var rootPath = Path.normalize(__dirname + "/../../..");
var dataPath = rootPath + "/database/initial-data/users-groups.json";

var BaseC = require(rootPath +  "/server/models/base-model.js").collection;
var baseC1 = new BaseC(),
    baseC2 = new BaseC();

// populate users_groups 
var usersGroupsArray = JSON.parse( stripJsonComments( fs.readFileSync(dataPath, "utf-8") ) );


var emailsUniq = _.chain(usersGroupsArray).pluck("email").uniq().value();
var emailsCriteria = [];

emailsUniq.forEach(function(email) {
    emailsCriteria.push({
        email: email
    });
});

// first we make a query to find the id of the user with the given email
var promise = baseC1.execute({
        query: {
            command: "select * from users_read($1);",
            arguments: JSON.stringify(emailsCriteria)
        }
    })
    .then(
        function() {
            if (baseC1.length === 0) {
                throw new Error("could not find any row with the given criteria: " + emailsCriteria);
            }
            // now construct the data for the new rows in users_groups
            usersGroupsArray.forEach(function(userGroup) {
                var model = baseC1.findWhere({
                    email: userGroup.email
                });
                if (model) {
                    userGroup.userId = model.get("id");
                }
            });

            // if some user was not found, remove it
            usersGroupsArray = _.filter(usersGroupsArray, function(obj) {
                return obj.userId !== undefined;
            });

            changeCase(usersGroupsArray, "underscored", 2);
            
            var promise2 = baseC2.execute({
                query: {
                    command: "select * from users_groups_create($1);",
                    arguments: JSON.stringify(usersGroupsArray)
                }
            });
            return promise2;
        }
    )
    .then(
        function(resp) {
            console.log("users_groups table has been populated.");
            console.log(jsonFormat(baseC2.toJSON()));
            return resp;
        }
    )
    .finally(function() {
        baseC1.disconnect();
        baseC2.disconnect();
    });

    

module.exports = promise;