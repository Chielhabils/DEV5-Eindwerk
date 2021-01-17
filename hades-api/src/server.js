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
 * Get boon by UUID
 * @param uuid 
 * @returns  1 boon with uuid = req.params.uuid
 */
app.get('/gods', async (req, res) => {
  const result = await pg
    .select('*')
    .from('godTable')
  res.json({
    res: result
  })
  res.status(200).send()
})

app.get('/god/:uuid', async (req, res) => {
  const result = await pg.select(['uuid', 'name', 'created_at']).from('godTable').where({uuid: req.params.uuid})
  res.json({
      res: result
  })
});

app.get("/boon/:uuid", async (req, res) => {
  const result = await pg.select(['uuid', 'godname', 'content', 'created_at']).from("boonTable").where({uuid: req.params.uuid});
  res.status(200);
  res.json({
    res: result,
  });
});

/**
 * Post a boon to the boonTable 
 * @params godname, content 
 * @returns  the posted boon
 */
app.post('/boon', async (req, res) => {
  const uuid = Helpers.generateUUID();
  const result = await pg
    .insert({
      uuid,
      godname: req.body.godname,
      content: req.body.content,
      created_at: new Date(),
    })
    .table('boonTable')
    .returning('*')
    .then((res) => {
      return res

app.post('/boon', async (req, res) => {
    const uuid = Helpers.generateUUID();
    const result = await pg
      .insert({
        uuid,
        godname: req.body.godname,
        content: req.body.content,
        created_at: new Date(),
      })
      .table('boonTable')
      .returning('*')
      .then((res) => {
        return res
      })
    res.status(200);
    res.json({
      res: result
    })
  res.status(200);
  res.json({
    res: result
  })
});

/**
 * Get all the boons
 * @param 
 * @returns  All the boons in the boonTable 
 */
app.get("/boons", async (req, res) => {
  await pg.from("boonTable").select("*").then(result => {
      res.status(200);
      res.send(result);
    })
});


/**
 * Updates a specific boon
 * @param uuid 
 * @returns  updated boon
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
 * Deletes a boon
 * @param uuid 
 * @returns nothing
 */
app.delete("/boon", (req, res) => {
  let amountOfProperties = Object.keys(req.body).length;
  if(amountOfProperties == 1 && req.body.uuid){
    pg('boonTable').where({ uuid: req.body.uuid }).del();
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});


/*******************************/
/*       Gods Endpoints        */
/*******************************/

/**
 * Get all the gods in the godTable
 * @param 
 * @returns  All the gods in the godTable
 */
app.get('/gods', async (req, res) => {
  const result = await pg
    .select('*')
    .from('godTable')
  res.json({
    res: result
  })
  res.status(200).send()
})

/**
 * Get a specific god by uuid
 * @param uuid 
 * @returns  1 god with uuid = req.params.uuid
 */
app.get('/god/:uuid', async (req, res) => {
  const result = await pg.select(['uuid', 'name', 'created_at']).from('godTable').where({uuid: req.params.uuid})
  res.json({
      res: result
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