(function() {

    function genId() {
        return Math.floor((1 + Math.random()) * 0x1000000)
                    .toString(16)
                    .substring(1);
    }

    // Accessors.
    var RawStorageAccessor = function(storage) {
        this.storage = storage;
    };
    RawStorageAccessor.prototype.get = function(key) {
        return this.storage.getItem(key);
    };
    RawStorageAccessor.prototype.set = function(key, value) {
        return this.storage.setItem(key, value);
    };
    RawStorageAccessor.prototype.remove = function(key) {
        return this.storage.removeItem(key);
    };

    var JSONStorageAccessor = function(storage) {
         this.storage = storage || localStorage;
    };
    JSONStorageAccessor.prototype.get = function(key) {
        return JSON.parse(this.storage.getItem(key));
    };
    JSONStorageAccessor.prototype.set = function(key, value) {
        return this.storage.setItem(key, JSON.stringify(value));
    };
    JSONStorageAccessor.prototype.remove = function(key) {
        return this.storage.removeItem(key);
    };
    // -Accessors


    var localStorageSchema = window.localStorageSchema = function(options) {
        options = options || {};
        var rootPrefix = options.schemaPrefix || '_lsscm',
            storage = options.storage || localStorage,
            schemaDelimiter = options.schemaDelimiter || ':',
            schemaAccessor = new (options.schemaAccessor || JSONStorageAccessor)(storage);

        
        var DaoMixin = function(schemaPrefix) {
            this.schemaPrefix = schemaPrefix;
        };
        DaoMixin.prototype.createKey = function(key) {
            return this.schemaPrefix + schemaDelimiter + key;
        };
        DaoMixin.prototype.get = function(id) {
            return schemaAccessor.get(this.createKey(id));
        };
        DaoMixin.prototype.set = function(id, mixed) {
            return schemaAccessor.set(this.createKey(id), mixed);
        };
        DaoMixin.prototype.del = function(id) {
            return schemaAccessor.remove(this.createKey(id));
        };
        DaoMixin.prototype.read = function() {
            return schemaAccessor.get(this.schemaPrefix);
        };
        DaoMixin.prototype.persist = function(mixed) {
            return schemaAccessor.set(this.schemaPrefix, mixed);
        };


        var NodeAccessor = function(schemaPrefix) {
            DaoMixin.call(this, schemaPrefix);
        };
        NodeAccessor.prototype = new DaoMixin();
        NodeAccessor.prototype.collection = function(collectionName) {
            return new CollectionDao(this.createKey(collectionName));
        };
        NodeAccessor.prototype.object = function(name) {
            return new ObjectDao(this.createKey(name));
        };
        NodeAccessor.prototype.node = function(name) {
            return new NodeAccessor(this.createKey(name));
        };

        var ObjectDao = function(schemaPrefix) {
            NodeAccessor.call(this, schemaPrefix);
        };
        ObjectDao.prototype = new NodeAccessor();

        var CollectionDao = function(schemaPrefix) {
            DaoMixin.call(this, schemaPrefix);
        };
        CollectionDao.prototype = new DaoMixin();
        CollectionDao.prototype.keys = function() {
            return this.read() || [];
        };
        CollectionDao.prototype.all = function() {
            return this.keys().map(this.get.bind(this));
        };
        CollectionDao.prototype.allWithKeys = function() {

        };
        CollectionDao.prototype.allObjects = function() {
            return this.keys().map(function(key) {
                return new ObjectDao(this.createKey(key));
            }, this);
        };
        CollectionDao.prototype.object = function(name) {
            return new ObjectDao(this.createKey(name));
        };
        CollectionDao.prototype.insert = function(mixed, id) {
            var keys = this.keys() || [],
                newId;
            if (id) {
                if (keys.indexOf(id) != -1) {
                    throw Error('Id ' + id + ' already exist.');
                } else {
                    newId = id;
                }
            } else {
                newId = genId();
                while (keys.indexOf(newId) != -1) newId = genId();
            }
            keys.push(newId);
            this.set(newId, mixed);
            this.persist(keys);
            return newId;
        };
        CollectionDao.prototype.select = function(filter, condition) {
            return this.all().filter(condition);
        };
        CollectionDao.prototype.del = function(id) {
            var keys = this.keys(),
                index = keys.indexOf(id);
            keys = keys.splice(index, index + 1);
            this.persist(keys);
            return DaoMixin.prototype.del.call(this, id);
        };


        return new NodeAccessor(rootPrefix);
    };

    localStorageSchema.accessors = {
        JSONStorageAccessor: JSONStorageAccessor,
        RawStorageAccessor: RawStorageAccessor
    };

})();
