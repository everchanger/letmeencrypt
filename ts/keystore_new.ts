let g_KeyStore: KeyStore;

class KeyStore 
{
    private m_IndxDb: IDBFactory;
    private m_db: IDBDatabase;
    private m_dbName: string;
    private m_objectStoreName: string;
    private m_is_open: boolean;

    constructor()
    {
        this.m_is_open          = false;
        this.m_dbName           = "KeyStore";
        this.m_objectStoreName  = "keys";
        this.m_IndxDb           = window.indexedDB;
        this.open();
    }

    public open() 
    {
        let req: IDBOpenDBRequest;
        req = this.m_IndxDb.open(this.m_dbName);
        req.onupgradeneeded = this.addTables;
        req.onsuccess       = this.opened;
    }

    // Callback for a successfull call to open.
    private opened(e: any) 
    {
        g_KeyStore.setOpen(true);
        g_KeyStore.setDb(e.target.result);
    }

    // Callback for a onupgradeneeded from open.
    private addTables(e: any) 
    {
        g_KeyStore.setOpen(true);
        g_KeyStore.setDb(e.target.result);

        if(!g_KeyStore.db().objectStoreNames.contains(g_KeyStore.objectStoreName())) 
        {
            let objStore = g_KeyStore.db().createObjectStore(g_KeyStore.objectStoreName(), {autoIncrement: true});
            objStore.createIndex("name", "name", {unique: false});
            objStore.createIndex("spki", "spki", {unique: false});
        }
    }

    // Stores a public/private keypair in IndexDB.
    public storeKey(publicKey: CryptoKey, privateKey: CryptoKey, name: string)  
    {
        if(!this.m_is_open) {
            return;
        }

        window.crypto.subtle.exportKey("spki", publicKey).
        then(function(spki) {
            let savedObject = {
                publicKey: publicKey,
                privateKey: privateKey,
                name: name,
                spki: spki
            };

            let transaction: IDBTransaction = g_KeyStore.db().transaction(g_KeyStore.objectStoreName(), "readwrite");
            transaction.onerror = function(e) {console.log(e);};
            transaction.onabort = function(e) {console.log(e);};
            transaction.oncomplete = function(e) {console.log(e);};

            let objStore: IDBObjectStore = transaction.objectStore(g_KeyStore.objectStoreName());
            let request: IDBRequest = objStore.add(savedObject);
        }).
        catch(function(err){
            console.log('error exporting key');
        });
    }

    // Clears the loaded keys from the IndexDB session.
    public clearDB() 
    {
        if(!this.m_is_open) {
            return;
        }

        let transaction: IDBTransaction = this.m_db.transaction(this.m_objectStoreName, "readwrite");

        let objStore: IDBObjectStore = transaction.objectStore(this.m_objectStoreName);
        let request: IDBRequest = objStore.clear();
    }

    public getKeyPair(propertyName:string, propertyValue:string) 
    {
        if(!this.m_is_open) {
            return;
        }


        let transaction: IDBTransaction = this.m_db.transaction(this.m_objectStoreName, "readwrite");
        let objStore: IDBObjectStore = transaction.objectStore(this.m_objectStoreName);
        let request: IDBRequest;

         if (propertyName === "id") {
            request = objStore.get(propertyValue);
        } else if (propertyName === "name") {
            request = objStore.index("name").get(propertyValue);
        } else if (propertyName === "spki") {
            request = objStore.index("spki").get(propertyValue);
        } else {
            return;
        }

        request.onsuccess = function(evt) {
            //fulfill(evt.target.result);
        };
    }

    public listKeys() 
    {
        if(!this.m_is_open) {
            return;
        }

        let list = [];

        let transaction: IDBTransaction = this.m_db.transaction(this.m_objectStoreName, "readwrite"); 
        transaction.onerror = function(e) {alert(e);};
        transaction.onabort = function(e) {console.log(e);};

        let objStore: IDBObjectStore    = transaction.objectStore(this.m_objectStoreName);
        let cursor: IDBRequest          = objStore.openCursor();

        cursor.onsuccess = function(evt:any) {
            if(evt.target.result) 
            {
                list.push({id: evt.target.result.key, value: evt.target.result.value});
                evt.target.result.continue();   
            }
        }
    }

    public close() 
    {
        if(!this.m_is_open) {
            return;
        }

        this.m_db.close();
        this.m_db = null;
    }

    // Getters

    public isOpen() :boolean  
    {
        return this.m_is_open;
    }


    public db() :IDBDatabase
    {
        return this.m_db;
    }

    public objectStoreName() :string
    {
        return this.m_objectStoreName;
    }

    // Setters

    public setOpen(open:boolean)
    {
        this.m_is_open = open;
    }

    public setDb(db:IDBDatabase)
    {
        this.m_db = db;
    }
}

g_KeyStore = new KeyStore();