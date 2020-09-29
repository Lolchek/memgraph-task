var express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
var app = express();
const neo4j = require("neo4j-driver").v1;

const handleCreate = require("./requestHandlers/handleCreate.js")

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const uri = "bolt://db:7687";
const driver = neo4j.driver(uri, neo4j.auth.basic("", ""), { encrypted: false });

router.post('/bookmarks',(request,response) => {
  //code to perform particular action.
  //To access POST variable use req.body()methods.
  url = request.body.url;
  tags = request.body.tags;
  author = request.body.author || "";
  handleCreate.createBookmarks(driver, url, tags, author).then(record => response.send(record));
  // process.stdout.write(JSON.stringify(res) + '\n');
});


router.get('/bookmarks', (request, response) => {
  const session = driver.session()

  var tags = request.query.tags;

  if (tags) {
    var ts = tags.split(",");
    return session
      .run(
        "MATCH (t :Tag )-[tg :Tagged]-(b :Bookmark) WHERE t.tag IN $tags return id(b) as bid, COUNT(t.tag) as c ORDER BY c DESC;",
        {"tags": ts})
      .then(result => {
        ids = []
        ids_to_occurences = {};
        for (r of result.records) {
          ids.push(r._fields[0].low);
          ids_to_occurences[r._fields[0].low] = r._fields[1];
        }
        session.run(
          "MATCH (t:Tag)--(b :Bookmark)--(a: Author) WHERE id(b) IN $ids return id(b), a.name, b.url, COLLECT(t.tag);",
          {"ids": ids}
        ).then(result => {
          var bms = {};
          for (r of result.records) {
            bms[r._fields[0].low] = {
              "url": r._fields[1],
              "tags": r._fields[2],
              "author": r._fields[3]
            }
          }
          
          var resp = [];
          for (id_ of ids){
            resp.push(Object.assign({"id": id_},bms[id_]));
          }
          response.send(resp);
          return result
        });
      })

  }


  var author = request.query.author;

  return session
    .run(
      `MATCH (t :Tag )-[tg :Tagged]-(b :Bookmark)-[ad: Authored]-(a: Author ${author ? "{name: $author}" : ""}) RETURN id(b), b.url as url, COLLECT(t.tag) as tags, a.name as author, b.date_created as dc ORDER BY dc DESC;`,
      {"author": author})
    .then(result => {
      session.close()

      records = result.records;
      bms = []
      for (r of records) {
        bms.push({
          "id": r._fields[0].low,
          "url": r._fields[1],
          "tags": r._fields[2],
          "author": r._fields[3]
        })
      }

      response.send(bms);
      // response.send(result);
      return result;
    })
  // response.send({
  //   "Hello": "World"
  // });
})

router.get('/bookmarks/:id', (request, response) => {
  const session = driver.session()
  return session
    .run(
      'MATCH (t :Tag )-[tg :Tagged]-(b :Bookmark)-[ad: Authored]-(a: Author ) WHERE id(b)=$id RETURN id(b), b.url as url, COLLECT(t.tag) as tags, a.name as author;', 
      {"id": Number(request.params.id)})
    .then(result => {
      session.close()
      res = {};
      for (r of result.records){
        res = {
          "id": r._fields[0].low,
          "url": r._fields[1],
          "tags": r._fields[2],
          "author": r._fields[3]
        }
      }
      
      response.send(res)
      return result;
    })
})

function stringToBoolean (string){
  switch(string.toLowerCase().trim()){
      case "true": case "yes": case "1": return true;
      case "false": case "no": case "0": case null: return false;
      default: return Boolean(string);
  }
}

router.get("/tags", (request, response) => {
  const session = driver.session()

  byFreq = request.query.sortByFrequency;

  if (byFreq && stringToBoolean(byFreq)){
    return session
      .run(
        "MATCH (b2:Bookmark) WITH COUNT(b2) AS total MATCH (t:Tag)--(b :Bookmark) return t.tag, COUNT(b)*1.0/total as freq ORDER BY freq DESC;"
      ).then(result => {
        var tags = [];
        for (r of result.records){
          tags.push({
            "tag": r._fields[0],
            "frequency": r._fields[1]
          });
        }
        response.send(tags);
        return result;
      })
  } else {
    return session
    .run(
      "MATCH (b2:Bookmark) WITH COUNT(b2) AS total MATCH (t:Tag)--(b :Bookmark) return t.tag, COUNT(b)*1.0/total as freq, t.date_created AS dc ORDER BY dc DESC;"
    ).then(result => {
      var tags = [];
      for (r of result.records){
        tags.push({
          "tag": r._fields[0],
          "frequency": r._fields[1]
        });
      }
      response.send(tags);
      return result;
    })
  }
})

router.delete('/bookmarks', (request, response) => {
    const session = driver.session()
    session.run("MATCH (n) DETACH DELETE n").then(
      result => {
        session.close();
      }
    );
    response.send("Database cleared.");
    return response;
})

app.use("/", router);

app.listen(3000, () => {
  const session = driver.session()
  // session.run("MATCH (n) DETACH DELETE n").then();
  session.run("CREATE CONSTRAINT ON (b:Bookmark) ASSERT b.url IS UNIQUE").then();
  session.run("CREATE CONSTRAINT ON (t:Tag) ASSERT t.name IS UNIQUE").then();
  session.run("CREATE CONSTRAINT ON (a:Author) ASSERT a.name IS UNIQUE").then(result => {
    session.close();
  });
  console.log("Server running on port 3000");
});