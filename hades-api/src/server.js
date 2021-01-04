const express = require('express')
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
    // to support URL-encoded bodies
    extended: true
  })
);  

app.get('/test', (req, res) => {

  res.status(200).send();
});

app.get('/', async (req, res) => {
  const result = await pg.select(['uuid', 'name', 'created_at']).from('gods')
  res.json({
      res: result
  })
});

app.get('/gods/:uuid', async (req, res) => {
  const result = await pg.select(['uuid', 'name', 'created_at']).from('gods').where({uuid: req.params.uuid})
  res.json({
      res: result
  })
});

app.get("/boon/:uuid", async (req, res) => {
  const result = await pg.select(["uuid", "content", "created_at"]).from("boon").where({ uuid: req.params.uuid });
  res.status(200);
  res.json({
    res: result,
  });
});


app.post('/postboon', async (req, res) => {
  if(req.body.content.length > 100){
    res.status(400);
    res.json({});
  } else{
    let uuid = Helpers.generateUUID();
    pg.insert({
      uuid: uuid,
      content: req.body.content,
      created_at: new Date(),
    }).into("boon").then(() => {
      res.status(200);
      res.json({ uuid: uuid});
    });
  }
});

app.get("/boons", async (req, res) => {
  await pg.from("boon").select("*").then(result => {
      res.status(200);
      res.send(result);
    })
});

app.delete("/deleteboon", (req, res) => {
  let amountOfProperties = Object.keys(req.body).length;
  if(amountOfProperties == 1 && req.body.uuid){
    pg('boon').where({ uuid: req.body.uuid }).del();
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

async function initialiseTables() {
  await pg.schema.hasTable('boon').then(async (exists) => {
    if (!exists) {
      await pg.schema
        .createTable('boon', (table) => {
          table.increments();
          table.uuid('uuid');
          table.string('content');
          table.string('god-id');
          table.timestamps(true, true);
        })
        .then(async () => {
          console.log('created table boon');
        });

    }
  });
  await pg.schema.hasTable('gods').then(async (exists) => {
    if (!exists) {
      await pg.schema
        .createTable('gods', (table) => {
          table.increments();
          table.uuid('uuid');
          table.string('name');
          table.string('description');
          table.timestamps(true, true);
        })
        .then(async () => {
          console.log('created table gods');
          for (let i = 0; i < 10; i++) {
            const uuid = Helpers.generateUUID();
            await pg.table('gods').insert({ uuid, title: `random element number ${i}` })
          }
        });
        
    }
  });
}
initialiseTables()

module.exports = app;