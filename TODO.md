-in the dashboard, we are loading the same libraries more than once

- create new npm module:
    + backbone-pg DONE
    + change-case-keys DONE
- when saving important fields that will be used to identify somethiing (such as emails), make sure we trim and toLowerCase before
- rename the files in ./client to dash-case (like in the rest of the project)

-the main index.js file shouldn't have any logic from hapi. It should be used to set global configurations, 

    require('pretty-error').start();
    require('colors');
    Nunjucks.configure(...)
    start pg

-enviar password por email
-criar utilizadores
-criar grupos
-criar textos
-editar textos inline



-create a big "SAVE" in the bottom
-loop over the texts collection
-filter by the hasChanged attribute
-create a new collection with the filtered models
-use collection.save() 


-texts rest route: take into account the validations for put and post (we should delete some properties in the client before sending the payload)

-what if the server can't connect to external services? (like mandrill) This can be simulated in the localhost if we don't have internet.

150223:

por os routes do general page num objecto

nunjucks ... | stringify

fazer um resumo do acontece desde o request ate à resposta
