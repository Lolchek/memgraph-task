var express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
var app = express();
const neo4j = require("neo4j-driver").v1;
const bookmark = require("./bookmark");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.get("/url", (req, res, next) => {
//   res.json(["Tony","Lisa","Michael","Ginger","Food"]);
//  });

const uri = "bolt://localhost:7687";
const driver = neo4j.driver(uri, neo4j.auth.basic("", ""));

router.post('/bookmarks',(request,response) => {
  //code to perform particular action.
  //To access POST variable use req.body()methods.
  response.send(request.body);

  // const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
  const session = driver.session()

  const resultPromise = session.writeTransaction(tx => {
    
    var b = bookmark.create(
      request.body.url,
      request.body.tags,
      request.body.author
    );
    
    console.log(b);

    tx.run(
      'CREATE (u:Bookmark {url: $url, tags: $tags, author: $author, date_created: $date_created});',
      b
    )

  })

  resultPromise.then(result => {
    session.close()
    // on application exit:
    driver.close()
})

});

router.get('/bookmarks', (request, response) => {
  const session = driver.session()
  return session
    .run('MATCH (u:Bookmark) RETURN u;')
    .then(result => {
      session.close()
      var bms = [];
      for (r of result.records){
        bms.push(bookmark.from_graph_result(r));
      }

      bms.sort(function (a, b){
        if (a.date_created > b.date_created) {
          return -1;
        }
        if (b.date_created > a.date_created) {
          return 1;
        }
        return 0;
      })
      response.send(bms);
      // response.send(result);
      return result;
    })
  // response.send({
  //   "Hello": "World"
  // });
})

router.delete('/bookmarks', (request, response) => {
    const session = driver.session()
    session.run("MATCH (n) DETACH DELETE n").then(
      result => {
        session.close();
      }
    );
    console.log("Database cleared.");
})

app.use("/", router);

app.listen(3000, () => {
 console.log("Server running on port 3000");
});