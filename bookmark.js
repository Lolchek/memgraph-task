var next_id = 0;

function create(url, tags, author, date_created = new Date().toISOString()){ 
    next_id += 1;
    return {
        "id": next_id,
        "url": url,
        "tags": tags,
        "author": author,
        "date_created": date_created
    }
}

function from_graph_result(result) {
//     const id = result._fields[0].properties.id;
//     const url = result._fields[0].properties.url;
//     const tags = result._fields[0].properties.tags;
//     const author = result._fields[0].properties.author;
//     const date_created = result._fields[0].properties.date_created;
    return result._fields[0].properties
}

module.exports = {
    "create": create,
    "from_graph_result": from_graph_result
}