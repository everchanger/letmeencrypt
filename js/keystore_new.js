let g_KeyStore;
class KeyStore {
    constructor() {
        this.m_is_open = false;
        this.m_dbName = "KeyStore";
        this.m_objectStoreName = "keys";
        this.m_IndxDb = window.indexedDB;
        this.open();
    }
    open() {
        let req;
        req = this.m_IndxDb.open(this.m_dbName);
        req.onupgradeneeded = this.addTables;
        req.onsuccess = this.opened;
    }
    // Callback for a successfull call to open.
    opened(e) {
        g_KeyStore.setOpen(true);
        g_KeyStore.setDb(e.target.result);
    }
    // Callback for a onupgradeneeded from open.
    addTables(e) {
        g_KeyStore.setOpen(true);
        g_KeyStore.setDb(e.target.result);
        if (!g_KeyStore.db().objectStoreNames.contains(g_KeyStore.objectStoreName())) {
            let objStore = g_KeyStore.db().createObjectStore(g_KeyStore.objectStoreName(), { autoIncrement: true });
            objStore.createIndex("name", "name", { unique: false });
            objStore.createIndex("spki", "spki", { unique: false });
        }
    }
    // Stores a public/private keypair in IndexDB.
    storeKey(publicKey, privateKey, name) {
        if (!this.m_is_open) {
            return;
        }
        window.crypto.subtle.exportKey("spki", publicKey).
            then(function (spki) {
            let savedObject = {
                publicKey: publicKey,
                privateKey: privateKey,
                name: name,
                spki: spki
            };
            let transaction = g_KeyStore.db().transaction(g_KeyStore.objectStoreName(), "readwrite");
            transaction.onerror = function (e) { console.log(e); };
            transaction.onabort = function (e) { console.log(e); };
            transaction.oncomplete = function (e) { console.log(e); };
            let objStore = transaction.objectStore(g_KeyStore.objectStoreName());
            let request = objStore.add(savedObject);
        }).
            catch(function (err) {
            console.log('error exporting key');
        });
    }
    // Clears the loaded keys from the IndexDB session.
    clearDB() {
        if (!this.m_is_open) {
            return;
        }
        let transaction = this.m_db.transaction(this.m_objectStoreName, "readwrite");
        let objStore = transaction.objectStore(this.m_objectStoreName);
        let request = objStore.clear();
    }
    getKeyPair(propertyName, propertyValue) {
        if (!this.m_is_open) {
            return;
        }
        let transaction = this.m_db.transaction(this.m_objectStoreName, "readwrite");
        let objStore = transaction.objectStore(this.m_objectStoreName);
        let request;
        if (propertyName === "id") {
            request = objStore.get(propertyValue);
        }
        else if (propertyName === "name") {
            request = objStore.index("name").get(propertyValue);
        }
        else if (propertyName === "spki") {
            request = objStore.index("spki").get(propertyValue);
        }
        else {
            return;
        }
        request.onsuccess = function (evt) {
            //fulfill(evt.target.result);
        };
    }
    listKeys() {
        if (!this.m_is_open) {
            return;
        }
        let list = [];
        let transaction = this.m_db.transaction(this.m_objectStoreName, "readwrite");
        transaction.onerror = function (e) { alert(e); };
        transaction.onabort = function (e) { console.log(e); };
        let objStore = transaction.objectStore(this.m_objectStoreName);
        let cursor = objStore.openCursor();
        cursor.onsuccess = function (evt) {
            if (evt.target.result) {
                list.push({ id: evt.target.result.key, value: evt.target.result.value });
                evt.target.result.continue();
            }
        };
    }
    close() {
        if (!this.m_is_open) {
            return;
        }
        this.m_db.close();
        this.m_db = null;
    }
    // Getters
    isOpen() {
        return this.m_is_open;
    }
    db() {
        return this.m_db;
    }
    objectStoreName() {
        return this.m_objectStoreName;
    }
    // Setters
    setOpen(open) {
        this.m_is_open = open;
    }
    setDb(db) {
        this.m_db = db;
    }
}
g_KeyStore = new KeyStore();
