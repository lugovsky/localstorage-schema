localstorage-schema
===================

A javascript library that provides api to work with browser localStorage like with a tree-based structure. So you can treat it like javascript database on top of browser's localStorage!

Creating a connection
---------------------

Of course, there is no physical connection itself, but to access the schema structure, you should create so-called schema object. CUrrently library exposes `localStorageSchema` function object to create it.

```javascript
var schema = localStorageSchema();
```

It also takes single parameter in which you can provide options for the connection:
* `schemaPrefix`: the default prefix for all database records. Defaults to `_lsscm`.
* `storage`: currently either `localStorage` or `sessionStorage` objects.
* `schemaDelimiter`: the delimiter between keys of nodes and leafs in the tree. Defaults to `:`.
* `schemaAccessor`: interface, used to access the storage itself. You can use `JSONStorageAccessor` or `RawStorageAccessor` (if you are using raw types only). Or you can write you own accessor just for your needs. Defaults to `JSONStorageAccessor`.

Calling the constructor with options looks like:

```javascript
var schema = localStorageSchema({
    schemaPrefix: '_lsscm',
    storage: window.localStorage,
    schemaDelimiter: ':',
    schemaAccessor: 'JSONStorageAccessor'
});
```

Getting data from the schema
----------------------------

Every piece of data in the schema is hidden behind its own DAO. Of cource you can access objects this way `schema.get('books:1')`. But the correct way is to use DAOs .There are two common types of DAO: `ObjectDao` and `CollectionDAO`. `ObjectDao` is used to access singletone objects in the schema, and the second one used to access collection-like structures.

You can create new collection and insert object to it like this.

```javascript
var books = schema.collection('books'),
    id = books.insert({ author: 'Stephen King', name: 'Shining' });
```

To get existing element from collection you can use this code:
```javascript
books.get(id);
// This code is equal to
books.object(id).read();
```

Disclaimer
----------

Library is currently in development. So if you have some suggestions, please feel free to contact me.

