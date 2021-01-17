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
    // to support URL-encoded bodies
    extended: true
  })
);  

app.get('/test', (req, res) => {

  res.status(200).send();
});

app.get('/gods', async (req, res) => {
  const result = await pg
    .select('*')
    .from('godTable')
  res.json({
    res: result
  })
  res.status(200).send()
})

app.get('/godTable/:uuid', async (req, res) => {
  const result = await pg.select(['uuid', 'name', 'created_at']).from('Table').where({uuid: req.params.uuid})
  res.json({
      res: result
  })
});


app.get("/boonTable/:uuid", async (req, res) => {
  const result = await pg.select(["uuid", "godname", "content", "created_at"]).from("boonTable").where({ uuid: req.params.uuid });
  res.status(200);
  res.json({
    res: result,
  });
});


app.post('/boonTable', async (req, res) => {
    // let uuid = Helpers.generateUUID();
    // pg.insert({
    //   uuid: uuid,
    //   //godName: req.body.godName,
    //   content: req.body.content,
    //   created_at: new Date(),
    // }).into('boon').then(() => {
    //   res.status(200);
    //   res.json({ uuid: uuid});
    // });
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
});

app.get("/boonTable", async (req, res) => {
  await pg.from("boonTable").select("*").then(result => {
      res.status(200);
      res.send(result);
    })
});

app.delete("/boonTable", (req, res) => {
  let amountOfProperties = Object.keys(req.body).length;
  if(amountOfProperties == 1 && req.body.uuid){
    pg('boonTable').where({ uuid: req.body.uuid }).del();
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

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