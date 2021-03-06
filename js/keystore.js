function KeyStore() {
    "use strict";
    var self = this;
    self.db = null;
    self.dbName = "KeyStore";
    self.objectStoreName = "keys";

    self.open = function() {
        return new Promise(function(fulfill, reject) {
            if (!window.indexedDB) {
                reject(new Error("IndexedDB is not supported by this browser."));
            }

            if(self.db) {
                fulfill(self);
            }

            var req = indexedDB.open(self.dbName, 1);
            req.onsuccess = function(evt) {
                self.db = evt.target.result;
                fulfill(self);
            };
            req.onerror = function(evt) {
                reject(evt.error);
            };
            req.onblocked = function() {
                reject(new Error("Database already open"));
            };

            // If the database is being created or upgraded to a new version,
            // see if the object store and its indexes need to be created.
            req.onupgradeneeded = function(evt) {
                self.db = evt.target.result;
                if (!self.db.objectStoreNames.contains(self.objectStoreName)) {
                    var objStore = self.db.createObjectStore(self.objectStoreName, {autoIncrement: true});
                    objStore.createIndex("name", "name", {unique: false});
                    objStore.createIndex("spki", "spki", {unique: false});
                }
            };
        });
    };

    // storeKey method
    //
    // Takes the public and private keys, and an arbitrary name
    // for the saved key. The private key can be passed as null if unavailable.
    //
    // Returns a Promise. If a key can be saved, the
    // Promise is fulfilled with a copy of the object
    // that was saved. Otherwise, it is rejected with an Error.
    //
    self.storeKey = function(publicKey, privateKey, name) {
        return new Promise(function(fulfill, reject) {
            if (!self.db) {
                reject(new Error("KeyStore is not open."));
            }

           
            var savedObject = {
                publicKey:  publicKey,
                privateKey: privateKey,
                name:       name
            };

            var transaction = self.db.transaction([self.objectStoreName], "readwrite");
            transaction.onerror = function(evt) {reject(evt.error);};
            transaction.onabort = function(evt) {reject(evt.error);};
            transaction.oncomplete = function(evt) {fulfill(savedObject);};

            var objectStore = transaction.objectStore(self.objectStoreName);
            var request = objectStore.add(savedObject);
        });
    };
	
	// clearDB method
    self.clearDB = function() {
        return new Promise(function(fulfill, reject) {
            if (!self.db) {
                reject(new Error("KeyStore is not open."));
            }

			var transaction = self.db.transaction([self.objectStoreName], "readwrite");

			var objectStore = transaction.objectStore(self.objectStoreName);
			var request = objectStore.clear();

        });
    };


    // getKey method
    //
    // Takes the name of a property (one of id, name, or spki), and
    // the value of that property to search for.
    //
    // Returns a Promise. If a key with the given propertyValue of
    // the specified propertyName exists in the database, the Promise
    // is fulfilled with the saved object, otherwise it is rejected
    // with an Error.
    //
    // If there are multiple objects with the requested propertyValue,
    // only one of them is passed to the fulfill function.
    //
    self.getKey = function(propertyName, propertyValue) {
        return new Promise(function(fulfill, reject) {
            if (!self.db) {
                reject(new Error("KeyStore is not open."));
            }

            var transaction = self.db.transaction([self.objectStoreName], "readonly");
            var objectStore = transaction.objectStore(self.objectStoreName);

            var request;
            if (propertyName === "id") {
                request = objectStore.get(propertyValue);
            } else if (propertyName === "name") {
                request = objectStore.index("name").get(propertyValue);
            } else if (propertyName === "spki") {
                request = objectStore.index("spki").get(propertyValue);
            } else {
                reject(new Error("No such property: " + propertyName));
            }

            request.onsuccess = function(evt) {
                fulfill(evt.target.result);
            };

            request.onerror = function(evt) {
                reject(evt.target.error);
            };
        });
    };

    // Delete key entry
    self.deleteKey = function(keyToDelete) {
        return new Promise(function(fulfill, reject) {
            if (!self.db) {
                reject(new Error("KeyStore is not open."));
            }

            var transaction = self.db.transaction([self.objectStoreName], "readwrite");
            var objectStore = transaction.objectStore(self.objectStoreName);

            var request;

            request = objectStore.index("name").openCursor();
           

            request.onsuccess = function(evt) {
                
                var cursor = evt.target.result;
                if(cursor) {
                    if(keyToDelete == cursor.value.name) 
                    {
                        cursor.delete();
                        fulfill(evt.target.result);
                        return;
                    }
                    cursor.continue();
                }
                
            };

            request.onerror = function(evt) {
                reject(evt.target.error);
            };
        });
    };


    // listKeys method
    //
    // Takes no parameters.
    //
    // Returns a Promise. Unless there is an error, fulfills the
    // Promise with an array of all objects from the key storage
    // database. Otherwise it rejects it with an Error.
    //
    self.listKeys = function() {
        return new Promise(function(fulfill, reject) {
            if (!self.db) {
                reject(new Error("KeyStore is not open."));
            }

            var list = [];

            var transaction = self.db.transaction([self.objectStoreName], "readonly");
            transaction.onerror = function(evt) {reject(evt.error);};
            transaction.onabort = function(evt) {reject(evt.error);};

            var objectStore = transaction.objectStore(self.objectStoreName);
            var cursor = objectStore.openCursor();

            cursor.onsuccess = function(evt) {
                if (evt.target.result) {
                    list.push({id: evt.target.result.key, value: evt.target.result.value});
                    evt.target.result.continue();
                } else {
                    fulfill(list);
                }
            }
        });
    };


    // close method
    //
    // Takes no parameters.
    //
    // Simply closes the database and returns immediately. Note that
    // the IndexedDB system actually closes the database in a separate
    // thread, and there is no way to know when that process is complete.
    //
    self.close = function() {
        return new Promise(function(fulfill, reject) {
            if (!self.db) {
                reject(new Error("KeyStore is not open."));
            }

            self.db.close();
            self.db = null;
            fulfill();
        });
    };
}