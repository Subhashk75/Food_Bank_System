const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
const { authMiddleware } = require('./utils/auth');
const cors = require('cors'); // Import the cors package
// Import routes
const routes = require('./routes'); // General routes (e.g., index.js)
const ProductRoute = require('./routes/product'); // Product-specific routes
const categoryRoute = require('./routes/category'); // Category-specific routes

// Import GraphQL schema
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
const app = express();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true, // Enables GraphQL Playground in development
    context: authMiddleware, // Applies auth middleware to GraphQL requests
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// cors add 
app.use(cors({
    origin: 'http://localhost:3000', // Allow only this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
    credentials: true // Enable if you need cookies or auth headers
}));


// Mount REST API routes
app.use(routes); // General routes
app.use('/api/v1', ProductRoute); // Product routes under /api/v1
app.use('/api/v1', categoryRoute); // Category routes under /api/v1

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
}

// Fallback route for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Start Apollo Server and Express
const startApolloServer = async () => {
    await server.start();
    server.applyMiddleware({ app });

    db.once('open', () => {
        app.listen(PORT, () => {
            console.log(`API server running on port ${PORT}!`);
            console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
        });
    });
};

startApolloServer();