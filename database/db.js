const dns = require('dns');
const mongoose = require('mongoose');

const configureDns = () => {
    const servers = (process.env.DNS_SERVERS || '')
        .split(',')
        .map(server => server.trim())
        .filter(Boolean);

    if (servers.length) {
        dns.setServers(servers);
    }
};

const getMongoUrl = () => {
    if (process.env.MONGODB_URI) return process.env.MONGODB_URI;

    const username = process.env.DB_USERNAME;
    const password = process.env.DB_PASSWORD;
    const cluster = process.env.DB_CLUSTER;

    if (!username || !password || !cluster) {
        throw new Error('Missing MongoDB environment variables. Set DB_USERNAME, DB_PASSWORD, and DB_CLUSTER in .env');
    }

    return `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${cluster}/?retryWrites=true&w=majority`;
}

const Connection = async () => {
    configureDns();
    const URL = getMongoUrl();
    try {
        await mongoose.connect(URL, { useUnifiedTopology: true, useNewUrlParser: true});
        console.log('Database Connected Successfully');
    } catch (error) {
        if (error.message.includes('querySrv')) {
            console.log('Error:', `${error.message}. Try setting DNS_SERVERS=8.8.8.8,1.1.1.1 in .env or changing your system DNS.`);
            return;
        }

        console.log('Error:', error.message);
    }
}

module.exports = { Connection, getMongoUrl, configureDns };
