const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const Helpers = require('./utils/helpers.js');
const port = 3000


const pg = require('knex')({
  client: 'pg',
  version: '9.6',      
  searchPath: ['knex', 'public'],
  connection: process.env.PG_CONNECTION_STRING ? process.env.PG_CONNECTION_STRING : 'postgres://example:example@localhost:5432/test'
});


const app = express();
http.Server(app); 


app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);  

app.get('/test', (req, res) => {
  res.status(200).send();
});

/*******************************/
/*       Boon Endpoints        */
/*******************************/


/**
 * Post boon tto boonTable
 * @params godname, uuid, content
 * @returns 
 */
app.post("/boon", (req, res) => {
  let uuid = Helpers.generateUUID();
    pg.insert({
      uuid: uuid,
      godname: req.body.godname,
      content: req.body.content,
      created_at: new Date(),
    })
      .into("boonTable")
      .then(() => {
        res.json({ uuid: uuid });
    });
});

/**
 * Get boon by UUID
 * @param uuid 
 * @returns  1 boon with uuid = req.params.uuid
 */
app.get("/boon/:uuid", async (req, res) => {
    const result = await pg.select(['uuid', 'godname', 'content', 'created_at']).from("boonTable").where({uuid: req.params.uuid});
    if(result.length == 0){
      res.status(404).send("Boon not found");
    } else{
      res.status(200).send(result[0]);
    }
});


/**
 * Get all boons in boonTable
 * @param
 * @returns All boons
 */
app.get('/boons', async (req, res) => {
  const result = await pg
    .select('*')
    .from('boonTable')
  res.json({
    res: result
  })
  res.status(200).send()
})


/**
 * Updates specific boom
 * @param uuid 
 * @returns
 */
app.patch("/boon/:uuid", async (req, res) => {
    pg('boonTable')
      .where({uuid: req.params.uuid})
      .update(req.body)
      .then(() => {
        res.sendStatus(200);
    })
});


/**
 * Deletes specific boon
 * @param uuid 
 * @returns
 */
app.delete("/boon", (req, res) => {
    pg('boonTable')
      .where({ uuid: req.body.uuid })
      .del()
      .then(() => {
        res.sendStatus(200);
    })
});

/*******************************/
/*       Gods Endpoints        */
/*******************************/

/**
 * Gets a specific god by uuid
 * @param uuid 
 * @returns god with uuid
 */
app.get('/god/:uuid', async (req, res) => {
  const result = await pg.select(['uuid', 'name', 'description', 'created_at']).from('godTable').where({uuid: req.params.uuid})
  if(result.length == 0){
    res.status(404).send("Boon not found");
  } else{
    res.status(200).send(result[0]);
  }
});

/**
 * Post god to godTable
 * @params name, uuid, description
 * @returns
 */
app.post('/god', async (req, res) => {
  const uuid = Helpers.generateUUID();
  const result = await pg
    .insert({
      uuid,
      name: req.body.name,
      description: req.body.description,
      created_at: new Date(),
    })
    .table('godTable')
    .returning('*')
    .then((res) => {
      return res
    })
  res.status(200);
  res.json({
    res: result
  })
});

/**
 * Deletes specific god
 * @param uuid 
 * @returns
 */
app.delete("/god", (req, res) => {
    pg('godTable')
      .where({ uuid: req.body.uuid })
      .del()
      .then(() => {
        res.sendStatus(200);
    })
});

/*******************************/
/*         Table inits         */
/*******************************/

async function initialiseTables() {
  await pg.schema.hasTable('godTable').then(async (exists) => {
    if (!exists) {
      await pg.schema
        .createTable('godTable', (table) => {
          table.increments();
          table.uuid('uuid');
          table.string('name');
          table.string('description');
          table.timestamps(true, true);
        })
        .then(async () => {
          console.log('created table god');
          for (let i = 0; i < 10; i++) {
            const uuid = Helpers.generateUUID();
            await pg.table('godTable').insert({ 
              uuid, 
              name: `god number ${i}`,
              description: 'A god of Olympus'
            })
          }
        });
        
    }
  });

  await pg.schema.hasTable('boonTable').then(async (exists) => {
    if (!exists) {
      await pg.schema
        .createTable('boonTable', (table) => {
          table.increments();
          table.uuid('uuid');
          table.string('godname');
          table.string('content');
          table.timestamps(true, true);
        })
        .then(async () => {
          console.log('created table boon');
        });
    }
  });
  
}
initialiseTables()

module.exports = app;