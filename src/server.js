const express = require('express');
const soap = require('soap');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.raw({ type: function() { return true; }, limit: '5mb' }));

// In-memory data storage (replace with MongoDB in production)
let users = [];
let articles = [];
let tags = [];
let sessions = new Map();

const JWT_SECRET = 'your-secret-key-here';

// Helper functions
const generateId = () => uuidv4();
const hashPassword = async (password) => await bcrypt.hash(password, 10);
const comparePassword = async (password, hash) => await bcrypt.compare(password, hash);
const generateToken = (userId) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Initialize with some sample data
const initializeData = async () => {
    // Sample users
    const hashedPassword = await hashPassword('password123');
    users = [
        {
            id: generateId(),
            username: 'johndoe',
            email: 'john@example.com',
            password: hashedPassword,
            bio: 'Software developer',
            avatar: 'https://example.com/avatar.jpg'
        },
        {
            id: generateId(),
            username: 'janedoe',
            email: 'jane@example.com',
            password: hashedPassword,
            bio: 'Technical writer',
            avatar: 'https://example.com/avatar2.jpg'
        }
    ];

    // Sample tags
    tags = [
        {
            id: generateId(),
            name: 'javascript',
            description: 'JavaScript programming language'
        },
        {
            id: generateId(),
            name: 'nodejs',
            description: 'Node.js runtime environment'
        }
    ];

    // Sample articles
    articles = [
        {
            id: generateId(),
            title: 'How to Build APIs',
            content: 'This article explains how to build RESTful APIs...',
            authorId: users[0].id,
            createdAt: new Date().toISOString(),
            tags: [tags[0]]
        }
    ];
};

// SOAP Service Implementation
const soapService = {
    MediumCloneService: {
        MediumClonePort: {
            
            // Session Operations
            Login: async function(args, callback) {
                try {
                    const { email, password } = args.parameters || args;
                    
                    if (!email || !password) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'Email and password are required',
                                detail: 'Missing required fields'
                            }
                        });
                    }

                    const user = users.find(u => u.email === email);
                    if (!user) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'Invalid credentials',
                                detail: 'User not found'
                            }
                        });
                    }

                    const isValid = await comparePassword(password, user.password);
                    if (!isValid) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'Invalid credentials',
                                detail: 'Wrong password'
                            }
                        });
                    }

                    const token = generateToken(user.id);
                    sessions.set(token, user.id);

                    const result = {
                        token,
                        user: {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            bio: user.bio,
                            avatar: user.avatar
                        }
                    };

                    callback(null, { parameters: result });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            Logout: function(args, callback) {
                try {
                    const token = args.parameters || args;
                    sessions.delete(token);
                    
                    callback(null, {
                        parameters: {
                            success: true,
                            message: 'Logged out successfully'
                        }
                    });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            // User Operations
            GetAllUsers: function(args, callback) {
                try {
                    const userList = users.map(u => ({
                        id: u.id,
                        username: u.username,
                        email: u.email,
                        bio: u.bio,
                        avatar: u.avatar
                    }));

                    callback(null, {
                        parameters: {
                            user: userList
                        }
                    });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            CreateUser: async function(args, callback) {
                try {
                    const userData = args.parameters || args;
                    
                    if (!userData.username || !userData.email || !userData.password) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'Username, email, and password are required',
                                detail: 'Missing required fields'
                            }
                        });
                    }

                    // Check if user already exists
                    if (users.find(u => u.email === userData.email)) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'User already exists',
                                detail: 'Email already registered'
                            }
                        });
                    }

                    const hashedPassword = await hashPassword(userData.password);
                    const newUser = {
                        id: generateId(),
                        username: userData.username,
                        email: userData.email,
                        password: hashedPassword,
                        bio: userData.bio || '',
                        avatar: userData.avatar || ''
                    };

                    users.push(newUser);

                    const result = {
                        id: newUser.id,
                        username: newUser.username,
                        email: newUser.email,
                        bio: newUser.bio,
                        avatar: newUser.avatar
                    };

                    callback(null, { parameters: result });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            GetUser: function(args, callback) {
                try {
                    const userId = args.parameters || args;
                    const user = users.find(u => u.id === userId);

                    if (!user) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'User not found',
                                detail: 'No user with the specified ID'
                            }
                        });
                    }

                    const result = {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        bio: user.bio,
                        avatar: user.avatar
                    };

                    callback(null, { parameters: result });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            UpdateUser: async function(args, callback) {
                try {
                    const { id, user: userData } = args;
                    const userIndex = users.findIndex(u => u.id === id);

                    if (userIndex === -1) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'User not found',
                                detail: 'No user with the specified ID'
                            }
                        });
                    }

                    if (userData.password) {
                        userData.password = await hashPassword(userData.password);
                    }

                    users[userIndex] = { ...users[userIndex], ...userData, id };

                    const result = {
                        id: users[userIndex].id,
                        username: users[userIndex].username,
                        email: users[userIndex].email,
                        bio: users[userIndex].bio,
                        avatar: users[userIndex].avatar
                    };

                    callback(null, { parameters: result });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            PartialUpdateUser: function(args, callback) {
                try {
                    const { id, userUpdate } = args;
                    const userIndex = users.findIndex(u => u.id === id);

                    if (userIndex === -1) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'User not found',
                                detail: 'No user with the specified ID'
                            }
                        });
                    }

                    Object.keys(userUpdate).forEach(key => {
                        if (userUpdate[key] !== undefined) {
                            users[userIndex][key] = userUpdate[key];
                        }
                    });

                    const result = {
                        id: users[userIndex].id,
                        username: users[userIndex].username,
                        email: users[userIndex].email,
                        bio: users[userIndex].bio,
                        avatar: users[userIndex].avatar
                    };

                    callback(null, { parameters: result });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            DeleteUser: function(args, callback) {
                try {
                    const userId = args.parameters || args;
                    const userIndex = users.findIndex(u => u.id === userId);

                    if (userIndex === -1) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'User not found',
                                detail: 'No user with the specified ID'
                            }
                        });
                    }

                    users.splice(userIndex, 1);

                    callback(null, {
                        parameters: {
                            success: true,
                            message: 'User deleted successfully'
                        }
                    });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            // Article Operations
            GetAllArticles: function(args, callback) {
                try {
                    callback(null, {
                        parameters: {
                            article: articles
                        }
                    });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            CreateArticle: function(args, callback) {
                try {
                    const articleData = args.parameters || args;
                    
                    if (!articleData.title || !articleData.content || !articleData.authorId) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'Title, content, and authorId are required',
                                detail: 'Missing required fields'
                            }
                        });
                    }

                    const newArticle = {
                        id: generateId(),
                        title: articleData.title,
                        content: articleData.content,
                        authorId: articleData.authorId,
                        createdAt: new Date().toISOString(),
                        tags: articleData.tags || []
                    };

                    articles.push(newArticle);
                    callback(null, { parameters: newArticle });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            GetArticle: function(args, callback) {
                try {
                    const articleId = args.parameters || args;
                    const article = articles.find(a => a.id === articleId);

                    if (!article) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'Article not found',
                                detail: 'No article with the specified ID'
                            }
                        });
                    }

                    callback(null, { parameters: article });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            UpdateArticle: function(args, callback) {
                try {
                    const { id, article: articleData } = args;
                    const articleIndex = articles.findIndex(a => a.id === id);

                    if (articleIndex === -1) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'Article not found',
                                detail: 'No article with the specified ID'
                            }
                        });
                    }

                    articles[articleIndex] = { ...articles[articleIndex], ...articleData, id };
                    callback(null, { parameters: articles[articleIndex] });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            PartialUpdateArticle: function(args, callback) {
                try {
                    const { id, articleUpdate } = args;
                    const articleIndex = articles.findIndex(a => a.id === id);

                    if (articleIndex === -1) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'Article not found',
                                detail: 'No article with the specified ID'
                            }
                        });
                    }

                    Object.keys(articleUpdate).forEach(key => {
                        if (articleUpdate[key] !== undefined) {
                            articles[articleIndex][key] = articleUpdate[key];
                        }
                    });

                    callback(null, { parameters: articles[articleIndex] });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            DeleteArticle: function(args, callback) {
                try {
                    const articleId = args.parameters || args;
                    const articleIndex = articles.findIndex(a => a.id === articleId);

                    if (articleIndex === -1) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'Article not found',
                                detail: 'No article with the specified ID'
                            }
                        });
                    }

                    articles.splice(articleIndex, 1);

                    callback(null, {
                        parameters: {
                            success: true,
                            message: 'Article deleted successfully'
                        }
                    });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            // Tag Operations
            GetAllTags: function(args, callback) {
                try {
                    callback(null, {
                        parameters: {
                            tag: tags
                        }
                    });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            CreateTag: function(args, callback) {
                try {
                    const tagData = args.parameters || args;
                    
                    if (!tagData.name) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'Tag name is required',
                                detail: 'Missing required fields'
                            }
                        });
                    }

                    const newTag = {
                        id: generateId(),
                        name: tagData.name,
                        description: tagData.description || ''
                    };

                    tags.push(newTag);
                    callback(null, { parameters: newTag });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            GetTag: function(args, callback) {
                try {
                    const tagId = args.parameters || args;
                    const tag = tags.find(t => t.id === tagId);

                    if (!tag) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'Tag not found',
                                detail: 'No tag with the specified ID'
                            }
                        });
                    }

                    callback(null, { parameters: tag });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            UpdateTag: function(args, callback) {
                try {
                    const { id, tag: tagData } = args;
                    const tagIndex = tags.findIndex(t => t.id === id);

                    if (tagIndex === -1) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'Tag not found',
                                detail: 'No tag with the specified ID'
                            }
                        });
                    }

                    tags[tagIndex] = { ...tags[tagIndex], ...tagData, id };
                    callback(null, { parameters: tags[tagIndex] });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            PartialUpdateTag: function(args, callback) {
                try {
                    const { id, tagUpdate } = args;
                    const tagIndex = tags.findIndex(t => t.id === id);

                    if (tagIndex === -1) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'Tag not found',
                                detail: 'No tag with the specified ID'
                            }
                        });
                    }

                    Object.keys(tagUpdate).forEach(key => {
                        if (tagUpdate[key] !== undefined) {
                            tags[tagIndex][key] = tagUpdate[key];
                        }
                    });

                    callback(null, { parameters: tags[tagIndex] });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            DeleteTag: function(args, callback) {
                try {
                    const tagId = args.parameters || args;
                    const tagIndex = tags.findIndex(t => t.id === tagId);

                    if (tagIndex === -1) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'Tag not found',
                                detail: 'No tag with the specified ID'
                            }
                        });
                    }

                    tags.splice(tagIndex, 1);

                    callback(null, {
                        parameters: {
                            success: true,
                            message: 'Tag deleted successfully'
                        }
                    });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            // Article-Tag Operations
            GetArticleTags: function(args, callback) {
                try {
                    const articleId = args.parameters || args;
                    const article = articles.find(a => a.id === articleId);

                    if (!article) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'Article not found',
                                detail: 'No article with the specified ID'
                            }
                        });
                    }

                    callback(null, {
                        parameters: {
                            tag: article.tags || []
                        }
                    });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            AddTagsToArticle: function(args, callback) {
                try {
                    const { articleId, tagIds } = args;
                    const article = articles.find(a => a.id === articleId);

                    if (!article) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'Article not found',
                                detail: 'No article with the specified ID'
                            }
                        });
                    }

                    const tagsToAdd = tags.filter(t => tagIds.item && tagIds.item.includes(t.id));
                    
                    if (!article.tags) {
                        article.tags = [];
                    }
                    
                    tagsToAdd.forEach(tag => {
                        if (!article.tags.find(t => t.id === tag.id)) {
                            article.tags.push(tag);
                        }
                    });

                    callback(null, {
                        parameters: {
                            success: true,
                            message: 'Tags added successfully'
                        }
                    });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            },

            RemoveTagsFromArticle: function(args, callback) {
                try {
                    const { articleId, tagIds } = args;
                    const article = articles.find(a => a.id === articleId);

                    if (!article) {
                        return callback({
                            Fault: {
                                faultcode: 'Client',
                                faultstring: 'Article not found',
                                detail: 'No article with the specified ID'
                            }
                        });
                    }

                    if (article.tags && tagIds.item) {
                        article.tags = article.tags.filter(t => !tagIds.item.includes(t.id));
                    }

                    callback(null, {
                        parameters: {
                            success: true,
                            message: 'Tags removed successfully'
                        }
                    });
                } catch (error) {
                    callback({
                        Fault: {
                            faultcode: 'Server',
                            faultstring: 'Internal server error',
                            detail: error.message
                        }
                    });
                }
            }
        }
    }
};

// Initialize data and start server
const startServer = async () => {
    await initializeData();
    
    const PORT = process.env.PORT || 8080;
    
    // Read WSDL file
    const wsdlFile = fs.readFileSync(path.join(__dirname, '../wsdl/medium-clone.wsdl'), 'utf8');
    
    // Create SOAP server
    soap.listen(app, '/soap', soapService, wsdlFile, function() {
        console.log('SOAP server listening on port ' + PORT);
        console.log('WSDL available at: http://localhost:' + PORT + '/soap?wsdl');
    });
    
    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({ 
            status: 'healthy', 
            service: 'Medium Clone SOAP API',
            timestamp: new Date().toISOString()
        });
    });
    
    app.listen(PORT, () => {
        console.log('Server started on port ' + PORT);
    });
};

startServer().catch(console.error);
