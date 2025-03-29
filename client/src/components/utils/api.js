const urldis = 'http://localhost:3001/api/v1/distribution';
const urlin = 'http://localhost:3001/api/v1/inventory';

export const sendDataDistribution = (data) =>
    fetch(`${urldis}/`, { // Ensure trailing slash or not based on backend setup
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then((response) => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
    })
    .catch((error) => {
        console.error('Error:', error);
    });

export const sendDataInventory = (data) =>
    fetch(`${urlin}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then((response) => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
    })
    .catch((error) => {
        console.error('Error:', error);
    });

export const getDataInventory = () =>
    fetch(`${urlin}/`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    }).then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
    })
    .catch(error => console.error('Error:', error));

export const getDataDistribution = () =>
    fetch(`${urldis}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    }).then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
    })
    .catch(error => console.error('Error:', error));
