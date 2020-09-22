async function createBookmarks(driver, url, tags, author=""){
  const session = driver.session()
  const record = await session.run(
    'MERGE (b:Bookmark {url: $url, date_created: $date_created}) RETURN id(b);',
    {"url": url, "date_created": new Date().toISOString()}
  ).catch((error) => console.log(error));

  for (tag of tags) {
    session.run(
      'MERGE (t:Tag {tag: $tag}) ON CREATE SET t.date_created = $date_created;',
      {"tag": tag, "date_created": new Date().toISOString()}
    ).then()
    session.run(
      'MATCH (b: Bookmark {url: $url}), (t:Tag {tag: $tag}) MERGE (b)-[:Tagged{score:1}]-(t);',
      {"url": url, "tag": tag}
    ).then()
  }

  session.run(
    'MERGE (a:Author {name: $name});',
    {"name": author}
  ).then()

  session.run(
    'MATCH (b: Bookmark {url: $url}), (a:Author {name: $name}) MERGE (b)-[:Authored]-(a);',
    {"url": url, "name": author}
  ).then(result => {
    session.close();
  });
  
  bId = record ? record.records[0]._fields[0].low : null;
  return {"bookmarkId": bId};
}

module.exports.createBookmarks = createBookmarks