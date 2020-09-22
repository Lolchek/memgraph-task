# memgraph-task

## API endpoints

[Saving a bookmark](#headers)  
[Getting saved bookmark by id](#emphasis) 
[Getting a list of bookmarks newest first](#emphasis) 
[Getting a list of bookmarks by author name](#emphasis) 
[Getting a list of bookmarks filtered by tags](#emphasis) 
[Getting a list of tags by date created and frequency](#emphasis) 

### Saving a bookmark
Input:
```
POST /bookmarks HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
"url": "some-url",
"tags": ["tag1", "tag2"],
"author": "Mem"
}
```

Output:
```
{
    "bookmarkId": someInt
}
```

### Getting saved bookmark by id
Input:
```
GET /bookmarks/{id} HTTP/1.1
Host: localhost:3000
```

Output:
```
{
    "id": {id},
    "url": {url},
    "tags": {tags},
    "author": {author}
}
```

### Getting a list of bookmarks newest first
Input:
```
GET /bookmarks HTTP/1.1
Host: localhost:3000
```

Output:
```
[
    {
        "id": {id},
        "url": {url},
        "tags": {tags},
        "author": {author}
    },
    ...
```

### Getting a list of bookmarks by author name
Input:
```
GET /bookmarks?author="Author" HTTP/1.1
Host: localhost:3000
```

Output (newest on top):
```
[
    {
        "id": {id},
        "url": {url},
        "tags": {tags},
        "author": {author}
    },
    ...
```

### Getting a list of bookmarks filtered by tags
Input:
```
GET /bookmarks?tags=tag1,tag2 HTTP/1.1
Host: localhost:3000
```

Output:
```
[
    {
        "id": {id},
        "url": {url},
        "tags": ["tag1", "tag2", "tag3"],
        "author": {author}
    },
    {
        "id": {id},
        "url": {url},
        "tags": ["tag1", "tag3"],
        "author": {author}
    }
    ...
```

### Getting a list of tags by date created and frequency

Input:

Sorted by date created:
```
GET /tags HTTP/1.1
Host: localhost:3000
```

Sorted by frequency:
```
GET /tags?sortByFrequency=1 HTTP/1.1
Host: localhost:3000
```
`sortByFrequency` can be `True`, `TRUE`, `true` or `1`.

Output:
```
[
    {
        "tag": "tag1",
        "frequency": 1
    },
    {
        "tag": "tag2",
        "frequency": 0.5
    }
]
```