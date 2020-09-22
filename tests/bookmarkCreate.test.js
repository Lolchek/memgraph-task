test('Tests if Bookmarks were saved', () => {
    const handleCreate = require("../requestHandlers/handleCreate.js");

    const url = "some_url";
    const tags = ['tag', 'tag2'];
    const author = null;

    jest.mock('neo4j-driver')

    const mockDriver = require("neo4j-driver").v1.driver;

    mockDriver.session = jest.fn(() => {
        obj = Object()
        obj.run = jest.fn().mockReturnValue(Promise.resolve({
            "records": [{"_fields": [{"low":3}]}]
        }));
        obj.close = jest.fn()
        return obj;
    });

    
    return handleCreate.createBookmarks(mockDriver, url, tags, author)
    .then(res => {
        expect(res["bookmarkId"]).toBe(3);
    });
  });