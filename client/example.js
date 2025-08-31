const soap = require('soap');

const WSDL_URL = 'http://localhost:8080/soap?wsdl';

class MediumCloneSOAPClient {
    constructor() {
        this.client = null;
        this.authToken = null;
    }

    async connect() {
        try {
            this.client = await soap.createClientAsync(WSDL_URL);
            console.log('✓ Connected to SOAP service');
            return true;
        } catch (error) {
            console.error('✗ Failed to connect to SOAP service:', error.message);
            return false;
        }
    }

    async login(email, password) {
        try {
            const [result] = await this.client.LoginAsync({
                parameters: { email, password }
            });
            
            this.authToken = result.parameters.token;
            console.log('✓ Login successful');
            console.log('  Token:', this.authToken);
            console.log('  User:', result.parameters.user);
            return result.parameters;
        } catch (error) {
            console.error('✗ Login failed:', error.message);
            throw error;
        }
    }

    async logout() {
        try {
            const [result] = await this.client.LogoutAsync({
                parameters: this.authToken
            });
            
            this.authToken = null;
            console.log('✓ Logout successful');
            return result.parameters;
        } catch (error) {
            console.error('✗ Logout failed:', error.message);
            throw error;
        }
    }

    async getAllUsers() {
        try {
            const [result] = await this.client.GetAllUsersAsync({
                parameters: ''
            });
            
            console.log('✓ Retrieved all users');
            console.log('  Count:', result.parameters.user ? result.parameters.user.length : 0);
            return result.parameters.user || [];
        } catch (error) {
            console.error('✗ Failed to get users:', error.message);
            throw error;
        }
    }

    async createUser(userData) {
        try {
            const [result] = await this.client.CreateUserAsync({
                parameters: userData
            });
            
            console.log('✓ User created successfully');
            console.log('  User:', result.parameters);
            return result.parameters;
        } catch (error) {
            console.error('✗ Failed to create user:', error.message);
            throw error;
        }
    }

    async getUser(userId) {
        try {
            const [result] = await this.client.GetUserAsync({
                parameters: userId
            });
            
            console.log('✓ Retrieved user');
            console.log('  User:', result.parameters);
            return result.parameters;
        } catch (error) {
            console.error('✗ Failed to get user:', error.message);
            throw error;
        }
    }

    async updateUser(userId, userData) {
        try {
            const [result] = await this.client.UpdateUserAsync({
                id: userId,
                user: userData
            });
            
            console.log('✓ User updated successfully');
            console.log('  User:', result.parameters);
            return result.parameters;
        } catch (error) {
            console.error('✗ Failed to update user:', error.message);
            throw error;
        }
    }

    async partialUpdateUser(userId, userUpdate) {
        try {
            const [result] = await this.client.PartialUpdateUserAsync({
                id: userId,
                userUpdate: userUpdate
            });
            
            console.log('✓ User partially updated successfully');
            console.log('  User:', result.parameters);
            return result.parameters;
        } catch (error) {
            console.error('✗ Failed to partially update user:', error.message);
            throw error;
        }
    }

    async deleteUser(userId) {
        try {
            const [result] = await this.client.DeleteUserAsync({
                parameters: userId
            });
            
            console.log('✓ User deleted successfully');
            return result.parameters;
        } catch (error) {
            console.error('✗ Failed to delete user:', error.message);
            throw error;
        }
    }

    async getAllArticles() {
        try {
            const [result] = await this.client.GetAllArticlesAsync({
                parameters: ''
            });
            
            console.log('✓ Retrieved all articles');
            console.log('  Count:', result.parameters.article ? result.parameters.article.length : 0);
            return result.parameters.article || [];
        } catch (error) {
            console.error('✗ Failed to get articles:', error.message);
            throw error;
        }
    }

    async createArticle(articleData) {
        try {
            const [result] = await this.client.CreateArticleAsync({
                parameters: articleData
            });
            
            console.log('✓ Article created successfully');
            console.log('  Article:', result.parameters);
            return result.parameters;
        } catch (error) {
            console.error('✗ Failed to create article:', error.message);
            throw error;
        }
    }

    async getArticle(articleId) {
        try {
            const [result] = await this.client.GetArticleAsync({
                parameters: articleId
            });
            
            console.log('✓ Retrieved article');
            console.log('  Article:', result.parameters);
            return result.parameters;
        } catch (error) {
            console.error('✗ Failed to get article:', error.message);
            throw error;
        }
    }

    async updateArticle(articleId, articleData) {
        try {
            const [result] = await this.client.UpdateArticleAsync({
                id: articleId,
                article: articleData
            });
            
            console.log('✓ Article updated successfully');
            console.log('  Article:', result.parameters);
            return result.parameters;
        } catch (error) {
            console.error('✗ Failed to update article:', error.message);
            throw error;
        }
    }

    async partialUpdateArticle(articleId, articleUpdate) {
        try {
            const [result] = await this.client.PartialUpdateArticleAsync({
                id: articleId,
                articleUpdate: articleUpdate
            });
            
            console.log('✓ Article partially updated successfully');
            console.log('  Article:', result.parameters);
            return result.parameters;
        } catch (error) {
            console.error('✗ Failed to partially update article:', error.message);
            throw error;
        }
    }

    async deleteArticle(articleId) {
        try {
            const [result] = await this.client.DeleteArticleAsync({
                parameters: articleId
            });
            
            console.log('✓ Article deleted successfully');
            return result.parameters;
        } catch (error) {
            console.error('✗ Failed to delete article:', error.message);
            throw error;
        }
    }

    async getAllTags() {
        try {
            const [result] = await this.client.GetAllTagsAsync({
                parameters: ''
            });
            
            console.log('✓ Retrieved all tags');
            console.log('  Count:', result.parameters.tag ? result.parameters.tag.length : 0);
            return result.parameters.tag || [];
        } catch (error) {
            console.error('✗ Failed to get tags:', error.message);
            throw error;
        }
    }

    async createTag(tagData) {
        try {
            const [result] = await this.client.CreateTagAsync({
                parameters: tagData
            });
            
            console.log('✓ Tag created successfully');
            console.log('  Tag:', result.parameters);
            return result.parameters;
        } catch (error) {
            console.error('✗ Failed to create tag:', error.message);
            throw error;
        }
    }

    async getTag(tagId) {
        try {
            const [result] = await this.client.GetTagAsync({
                parameters: tagId
            });
            
            console.log('✓ Retrieved tag');
            console.log('  Tag:', result.parameters);
            return result.parameters;
        } catch (error) {
            console.error('✗ Failed to get tag:', error.message);
            throw error;
        }
    }

    async updateTag(tagId, tagData) {
        try {
            const [result] = await this.client.UpdateTagAsync({
                id: tagId,
                tag: tagData
            });
            
            console.log('✓ Tag updated successfully');
            console.log('  Tag:', result.parameters);
            return result.parameters;
        } catch (error) {
            console.error('✗ Failed to update tag:', error.message);
            throw error;
        }
    }

    async partialUpdateTag(tagId, tagUpdate) {
        try {
            const [result] = await this.client.PartialUpdateTagAsync({
                id: tagId,
                tagUpdate: tagUpdate
            });
            
            console.log('✓ Tag partially updated successfully');
            console.log('  Tag:', result.parameters);
            return result.parameters;
        } catch (error) {
            console.error('✗ Failed to partially update tag:', error.message);
            throw error;
        }
    }

    async deleteTag(tagId) {
        try {
            const [result] = await this.client.DeleteTagAsync({
                parameters: tagId
            });
            
            console.log('✓ Tag deleted successfully');
            return result.parameters;
        } catch (error) {
            console.error('✗ Failed to delete tag:', error.message);
            throw error;
        }
    }

    async getArticleTags(articleId) {
        try {
            const [result] = await this.client.GetArticleTagsAsync({
                parameters: articleId
            });
            
            console.log('✓ Retrieved article tags');
            console.log('  Count:', result.parameters.tag ? result.parameters.tag.length : 0);
            return result.parameters.tag || [];
        } catch (error) {
            console.error('✗ Failed to get article tags:', error.message);
            throw error;
        }
    }

    async addTagsToArticle(articleId, tagIds) {
        try {
            const [result] = await this.client.AddTagsToArticleAsync({
                articleId: articleId,
                tagIds: { item: tagIds }
            });
            
            console.log('✓ Tags added to article successfully');
            return result.parameters;
        } catch (error) {
            console.error('✗ Failed to add tags to article:', error.message);
            throw error;
        }
    }

    async removeTagsFromArticle(articleId, tagIds) {
        try {
            const [result] = await this.client.RemoveTagsFromArticleAsync({
                articleId: articleId,
                tagIds: { item: tagIds }
            });
            
            console.log('✓ Tags removed from article successfully');
            return result.parameters;
        } catch (error) {
            console.error('✗ Failed to remove tags from article:', error.message);
            throw error;
        }
    }
}

// Demo function that demonstrates all SOAP operations
async function demonstrateSOAPOperations() {
    console.log('=== Medium Clone SOAP Client Demo ===\n');
    
    const client = new MediumCloneSOAPClient();
    
    try {
        // Connect to service
        console.log('1. Connecting to SOAP service...');
        const connected = await client.connect();
        if (!connected) {
            throw new Error('Failed to connect to SOAP service');
        }
        console.log();

        // Test Login
        console.log('2. Testing Login...');
        await client.login('john@example.com', 'password123');
        console.log();

        // Test User Operations
        console.log('3. Testing User Operations...');
        
        // Get all users
        const users = await client.getAllUsers();
        const firstUserId = users.length > 0 ? users[0].id : null;
        
        // Create a new user
        const newUser = await client.createUser({
            username: 'testuser',
            email: 'test@example.com',
            password: 'testpass123',
            bio: 'Test user created via SOAP',
            avatar: 'https://example.com/test-avatar.jpg'
        });
        
        // Get specific user
        if (firstUserId) {
            await client.getUser(firstUserId);
        }
        
        // Update user
        await client.partialUpdateUser(newUser.id, {
            bio: 'Updated bio via SOAP'
        });
        console.log();

        // Test Article Operations
        console.log('4. Testing Article Operations...');
        
        // Get all articles
        const articles = await client.getAllArticles();
        
        // Create a new article
        const newArticle = await client.createArticle({
            title: 'SOAP API Tutorial',
            content: 'This article explains how to use SOAP APIs effectively...',
            authorId: firstUserId || newUser.id
        });
        
        // Get specific article
        await client.getArticle(newArticle.id);
        
        // Update article
        await client.partialUpdateArticle(newArticle.id, {
            title: 'Updated: SOAP API Tutorial'
        });
        console.log();

        // Test Tag Operations
        console.log('5. Testing Tag Operations...');
        
        // Get all tags
        const tags = await client.getAllTags();
        
        // Create a new tag
        const newTag = await client.createTag({
            name: 'soap',
            description: 'Simple Object Access Protocol'
        });
        
        // Get specific tag
        await client.getTag(newTag.id);
        
        // Update tag
        await client.partialUpdateTag(newTag.id, {
            description: 'Simple Object Access Protocol - Web Services'
        });
        console.log();

        // Test Article-Tag Operations
        console.log('6. Testing Article-Tag Operations...');
        
        // Add tags to article
        const tagIds = tags.length > 0 ? [tags[0].id] : [];
        if (tagIds.length > 0) {
            await client.addTagsToArticle(newArticle.id, tagIds);
        }
        
        // Get article tags
        await client.getArticleTags(newArticle.id);
        
        // Remove tags from article
        if (tagIds.length > 0) {
            await client.removeTagsFromArticle(newArticle.id, tagIds);
        }
        console.log();

        // Test Logout
        console.log('7. Testing Logout...');
        await client.logout();
        console.log();

        console.log('=== All SOAP operations completed successfully! ===');
        
    } catch (error) {
        console.error('Demo failed:', error.message);
        if (error.root && error.root.Envelope && error.root.Envelope.Body && error.root.Envelope.Body.Fault) {
            const fault = error.root.Envelope.Body.Fault;
            console.error('SOAP Fault:', fault);
        }
    }
}

// Run the demo
if (require.main === module) {
    demonstrateSOAPOperations();
}

module.exports = MediumCloneSOAPClient;
