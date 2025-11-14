(async () => {
    try {
        const res = await fetch('http://localhost:5000/api/encrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: 'hello', cipher: 'atbash-caesar', shift: 3 })
        });
        const js = await res.json();
        console.log('/api/encrypt ->', js);
    } catch (e) { console.error('/api/encrypt error', e); }

    try {
        const res2 = await fetch('http://localhost:5000/api/secure/encrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: 'secret message' })
        });
        const js2 = await res2.json();
        console.log('/api/secure/encrypt ->', js2);
    } catch (e) { console.error('/api/secure/encrypt error', e); }
})();
