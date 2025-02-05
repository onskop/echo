import { config } from './config.js';


export async function loadData(schedulerID) {
    try {
        const response = await fetch(`${config.SERVER_URL}/api/load?schedulerID=${schedulerID}`, {method: 'GET'});
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error; // Propagate the error to handle it in the calling code
    }
}




export async function syncChanges(changes, schedulerID) {

    const payload = {schedulerID, changes};
    const response = await fetch(`${config.SERVER_URL}/api/sync`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Sync API request failed: HTTP ${response.status} - ${response.statusText}`);
    }
    return await response.json();

}


export async function saveSchedulerSettings(schedulerID, settings) {
    try {
        const response = await fetch(`${config.SERVER_URL}/api/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                schedulerID,
                settings
            })
        });

        if (!response.ok) {
            throw new Error(`Response error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to save settings:', error);
        throw error;
    }
}

export async function loadSchedulerSettings(schedulerID) {
    try {
        const response = await fetch(`${config.SERVER_URL}/api/settings?schedulerID=${schedulerID}`);
        if (!response.ok) {
            throw new Error(`Response error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to load settings:', error);
        throw error;
    }

}