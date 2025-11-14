import http from 'http';

function makeRequest(path, method, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', reject);
        req.write(JSON.stringify(body));
        req.end();
    });
}

(async () => {
    console.log('Testing backend endpoints...\n');

    try {
        console.log('1. Testing /api/encrypt');
        const r1 = await makeRequest('/api/encrypt', 'POST', { text: 'hello', cipher: 'atbash-caesar', shift: 3 });
        console.log('   Status:', r1.status, '| Response:', JSON.stringify(r1.body));

        console.log('\n2. Testing /api/decrypt');
        const r2 = await makeRequest('/api/decrypt', 'POST', { text: 'vyrro', cipher: 'atbash-caesar', shift: 3 });
        console.log('   Status:', r2.status, '| Response:', JSON.stringify(r2.body));

        console.log('\n3. Testing /api/secure/encrypt');
        const r3 = await makeRequest('/api/secure/encrypt', 'POST', { text: 'secret message' });
        console.log('   Status:', r3.status, '| Response:', JSON.stringify(r3.body));

        console.log('\n4. Testing /api/secure/decrypt');
        const r4 = await makeRequest('/api/secure/decrypt', 'POST', {
            ciphertext: r3.body.ciphertext,
            iv: r3.body.iv,
            tag: r3.body.tag
        });
        console.log('   Status:', r4.status, '| Response:', JSON.stringify(r4.body));

        console.log('\n✅ ALL ENDPOINTS WORKING!');
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
})();
