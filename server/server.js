// kinda imports

const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const sql = require('mssql/msnodesqlv8');

// middleware
app.use(express.json());
app.use(cors());



// database connection
const configDB = {
    connectionString: 'Driver={SQL Server};Server=pvsrv012;Database=echo;Trusted_Connection=yes;',
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    driver: 'msnodesqlv8'
};

let pool; // global pool for reusable connection object created in connectDB(), instantiated when server starts
async function connectDB() {
    try {
        pool = await sql.connect(configDB);
        console.log('Connected to the database');
    } catch (err) {
        console.error('Failed to connect to the database:', err);
        process.exit(1);
    }
}

async function executeQuery(query, params = {}) {
    try {
        if (!pool) {await connectDB();}
        const request = pool.request();
        
        // Simplified parameter handling - keep it for now but should be removed later
        for (const key in params) {
            const value = params[key];
            if (value === null) {
                request.input(key, null);
            } else if (typeof value === 'number') {
                request.input(key, sql.Int, value);
            } else {
                // Everything else (including dates) as strings
                request.input(key, sql.NVarChar(sql.MAX), value);
            }
        }
        
        const result = await request.query(query);
        return result;

    } catch (err) {
        console.error('Error executing query:', err);
        console.error('Failed query:', query);
        console.error('Failed params:', params);
        throw err;
    }
}

// logging ---------------------------------------------------------------------------------
async function logEvent(username, category, payload) {
    try {
        const query = `
            INSERT INTO tblAuditLog (
                Username,
                EventDateTime,
                EventCategory,
                EventPayload
            ) VALUES (
                @username,
                GETDATE(),
                @category,
                @payload
            )
        `;
        
        await executeQuery(query, {
            username,
            category,
            payload: JSON.stringify(payload)
        });
    } catch (err) {
        console.error('Error logging event:', err);
    }
}

async function logError(source, errorMessage, errorStack, username = '') {
    try {
        const query = `
            INSERT INTO tblErrors (
                DateTime,
                Source,
                Message,
                Stack,
                Username
            ) VALUES (
                GETDATE(),
                @source,
                @errorMessage,
                @errorStack,
                @username
            )
        `;
        
        await executeQuery(query, {
            source,
            errorMessage,
            errorStack,
            username
        });
    } catch (err) {
        console.error('Error logging error to database:', err);
    }
}

app.post('/api/log-error', async (req, res) => {
    try {
        const { source, message, stack, username } = req.body;
        await logError(source, message, stack, username);
        res.json({ success: true, message: 'Error logged successfully' });
    } catch (err) {
        console.error('Error in /api/log-error endpoint:', err);
        res.status(500).json({ success: false, message: 'Failed to log error' });
    }
});

 // end of logging ---------------------------------------------------------------------------------


connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});

// SUPPORT FUNCTIONS ---------------------------------------------------------------------------------

async function processAdded(store, changes, schedulerID) {
    console.log(`Processing added records for store: ${store}`);
    if (!changes[store]?.added?.length) {
        console.log(`No added records for ${store}`);
        return new Map();
    }
    console.log(`Found ${changes[store].added.length} records to add in ${store}`);
    

    const records = changes[store].added.map(record => {
        return {
            phantomId: record.$PhantomId,
            dbRecord: {...record, schedulerID}
        };
    });
    console.log(`Transformed records for ${store}:`, records);

    // Remove $PhantomId from the database record
    records.forEach(r => delete r.dbRecord.$PhantomId);

    const idMapping = new Map();
    for (const record of records) {
        // Only use fields that exist in this record
        const fields = Object.keys(record.dbRecord);
        const query = `
            INSERT INTO ${store}Data (
                ${fields.join(', ')}
            ) VALUES (
                ${fields.map(k => '@' + k).join(', ')}
            );
            SELECT SCOPE_IDENTITY() AS newId;
        `;
        
        console.log(`Inserting record into ${store}:`, record.dbRecord);
        const result = await executeQuery(query, record.dbRecord);
        idMapping.set(record.phantomId, result.recordset[0].newId);
    }
    
    return idMapping;
}



async function processUpdated(store, changes, schedulerID) {
    if (!changes[store]?.updated?.length) return;

    for (const record of changes[store].updated) {
        // Filter out prototype and create parameter assignments
        const updateFields = Object.keys(record)
            .filter(key => !['id', '[[Prototype]]'].includes(key))
            .map(key => `${key} = @${key}`)
            .join(', ');

        const query = `
            UPDATE ${store}Data 
            SET ${updateFields}
            WHERE id = @id AND schedulerID = @schedulerID
        `;

        await executeQuery(query, { ...record, schedulerID });
    }
}

async function processRemoved(store, changes, schedulerID) {
    if (!changes[store]?.removed?.length) return;

    const ids = changes[store].removed.map(r => r.id);
    const query = `
        DELETE FROM ${store}Data 
        WHERE id IN (${ids.map((_, i) => '@id' + i).join(', ')})
        AND schedulerID = @schedulerID
    `;

    const params = {
        schedulerID,
        ...ids.reduce((acc, id, i) => ({ ...acc, ['id' + i]: id }), {})
    };
    console.log('processRemoving query: ', query);
    await executeQuery(query, params);
}









// ROUTES ---------------------------------------------------------------------------------
app.get('/', (req, res) => {
    res.send('Hello World');
});


// GREAT LOADING ENDPOINT ---------------------------------------------------------------------------------
app.get('/api/load', async (req, res) => {
    console.log('Load endpoint called');

try {
    const { schedulerID } = req.query;
    if (!schedulerID) {
        return res.status(400).json({success: false, message: 'Missing required fields: schedulerID'});
    }

    const queryProject = `SELECT * FROM schedulersData WHERE schedulerID = @schedulerID`;
    const resultProject = await executeQuery(queryProject, { schedulerID });

    const queryResources = `SELECT * FROM resourcesData WHERE schedulerID = @schedulerID`;
    const resultResources = await executeQuery(queryResources, { schedulerID });

    const queryEvents = `SELECT * FROM eventsData WHERE schedulerID = @schedulerID`;
    const resultEvents = await executeQuery(queryEvents, { schedulerID });


    const queryAssignments = `SELECT * FROM assignmentsData WHERE schedulerID = @schedulerID`;
    const resultAssignments = await executeQuery(queryAssignments, { schedulerID });


    const queryDependencies = `SELECT * FROM dependenciesData WHERE schedulerID = @schedulerID`;
    const resultDependencies = await executeQuery(queryDependencies, { schedulerID });

    const output = {
        scheduler: [...resultProject.recordset], 
        project: {
            resourcesData: [...resultResources.recordset], 
            eventsData: [...resultEvents.recordset], 
            assignmentsData: [...resultAssignments.recordset], 
            dependenciesData: [...resultDependencies.recordset]
        }
    }
    res.json(output);


} catch (error) {
    console.error('Error processing load request:', error);
        res.status(500).json({success: false, message: 'Internal server error during load'});
    }
});


// GREAT SAVING ENDPOINT ---------------------------------------------------------------------------------
app.post('/api/sync', async (req, res) => {
    console.log('Sync endpoint called:', new Date().toISOString());
    
    try {
        const { schedulerID, changes } = req.body;
        console.log('Received changes:', JSON.stringify(changes, null, 2));
        console.log('For schedulerID:', schedulerID);

        if (!schedulerID || !changes) {
            console.log('Missing required fields');
            return res.status(400).json({
                success: false, 
                message: 'Missing required fields: schedulerID and changes'
            });
        }


        // Here is section that changes the field names from coming object "changes" to match the database
        const fieldMappings = {
            dependencies: {
                from: 'fromEvent',
                to: 'toEvent'
            }
            // Add more store mappings as needed
        };

        // Helper function to remap field names
        const remapFields = (record, storeMapping) => {
            if (!storeMapping) return record;
            
            const remappedRecord = { ...record };
            for (const [fromField, toField] of Object.entries(storeMapping)) {
                if (remappedRecord[fromField] !== undefined) {
                    remappedRecord[toField] = remappedRecord[fromField];
                    delete remappedRecord[fromField];
                }
            }
            return remappedRecord;
        };

        // Actual application of remapping the field names
        for (const store in changes) {
            const mapping = fieldMappings[store];
            if (!mapping) continue;

            if (changes[store]?.added) {
                changes[store].added = changes[store].added.map(record => 
                    remapFields(record, mapping)
                );
            }
            if (changes[store]?.updated) {
                changes[store].updated = changes[store].updated.map(record => 
                    remapFields(record, mapping)
                );
            }
        }
        // End of remapping the field names


        // Replace all phantom IDs in the entire changes object
        const replacePhantomIds = (obj, idMapping) => {
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    replacePhantomIds(obj[key], idMapping);
                } else if (idMapping.has(obj[key])) {
                    obj[key] = idMapping.get(obj[key]);
                }
            }
        };

        // In the sync endpoint, update the processing section:
        const stores = ['resources', 'events', 'assignments', 'dependencies'];
        console.log('Processing stores in order:', stores);
        
        // First get all ID mappings
        const idMapping = new Map();
        
        // Process each store's additions, remapping IDs before each store
        for (const store of stores) {
            console.log(`Checking ${store} for additions...`);
            // Remap any phantom IDs from previous additions
            replacePhantomIds(changes, idMapping);
            
            if (changes[store]?.added?.length) {
                const storeMapping = await processAdded(store, changes, schedulerID);
                storeMapping.forEach((value, key) => idMapping.set(key, value));
            }
        }

        // Final remapping for updates
        replacePhantomIds(changes, idMapping);

        // Process updates and removals
        for (const store of stores.reverse()) {
            await processUpdated(store, changes, schedulerID);
            await processRemoved(store, changes, schedulerID);
        }

        console.log('Sync completed successfully');
        res.json({ success: true });

    } catch (error) {
        console.error('Error in sync endpoint:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            success: false, 
            message: 'Internal server error during sync'
        });
    }
});


// Add settings endpoints
app.post('/api/settings', async (req, res) => {
    try {
        const { schedulerID, settings } = req.body;
        
        // Update settings in schedulersData table
        const query = `
            UPDATE schedulersData 
            SET mode = @mode
            WHERE schedulerID = @schedulerID
        `;
        

        await executeQuery(query, { 
            schedulerID,
            mode: settings.mode
        });


        res.json({ success: true });
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/settings', async (req, res) => {
    try {
        const { schedulerID } = req.query;
        
        const query = `
            SELECT mode
            FROM schedulersData 
            WHERE schedulerID = @schedulerID
        `;
        
        const result = await executeQuery(query, { schedulerID });
        
        res.json(result.recordset[0] || { mode: 'horizontal' });
    } catch (error) {
        console.error('Error loading settings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});






