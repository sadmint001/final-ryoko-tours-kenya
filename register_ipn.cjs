const https = require('https');

const key = 'niIGYochkntyMlK3b5159pQV+HafNln3';
const secret = 'N8q5FkX2ucF/y6XA3ZcuD/gbOsI=';
const isLive = true;
const callbackUrl = 'https://zpqccmbnvzwbcoeirffz.supabase.co/functions/v1/pesapal-callback';

const baseUrl = isLive ? 'https://pay.pesapal.com/v3' : 'https://cyb3r.pesapal.com/pesapalv3';

async function register() {
    console.log('Authenticating...');
    const token = await getToken();
    console.log('Got Token:', token.substring(0, 20) + '...');

    console.log('Registering IPN URL:', callbackUrl);

    const data = JSON.stringify({
        url: callbackUrl,
        ipn_notification_type: 'POST'
    });

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(`${baseUrl}/api/URLSetup/RegisterIPN`, options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                console.log('Status Code:', res.statusCode);
                console.log('Response Body:', body);
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const json = JSON.parse(body);
                        console.log('SUCCESS! IPN ID:', json.ipn_id);
                    } catch (e) {
                        console.log('Could not parse JSON success response');
                    }
                }
                resolve();
            });
        });

        req.on('error', (e) => {
            console.error('Request Error:', e);
            reject(e);
        });

        req.write(data);
        req.end();
    });
}

function getToken() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            consumer_key: key,
            consumer_secret: secret
        });

        const req = https.request(`${baseUrl}/api/Auth/RequestToken`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (json.token) resolve(json.token);
                    else reject('No token in response: ' + body);
                } catch (e) {
                    reject('Invalid JSON token response: ' + body);
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

register().catch(console.error);
