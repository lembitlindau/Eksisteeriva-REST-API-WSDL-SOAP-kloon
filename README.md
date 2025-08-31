# Medium Clone SOAP API

This project is a SOAP web service clone of the existing Medium-like REST API. It provides functionally equivalent SOAP operations for all REST endpoints, maintaining the same business logic and data structures while following SOAP/WSDL standards.

## Project Overview

This SOAP API implementation provides a complete functional equivalent of the original REST API with the following features:

- **Session Management**: Login/logout with JWT token authentication
- **User Management**: CRUD operations for user accounts
- **Article Management**: CRUD operations for blog articles
- **Tag Management**: CRUD operations for content tags
- **Article-Tag Relations**: Managing tag associations with articles
- **Error Handling**: Proper SOAP fault responses for error conditions
- **WSDL Documentation**: Complete service description with XSD schemas

## Project Structure

```
/project-root
├── wsdl/                    # WSDL and XSD files
│   └── medium-clone.wsdl    # Complete WSDL service definition
├── src/                     # Source code
│   └── server.js            # Main SOAP server implementation
├── client/                  # Client examples
│   └── example.js           # Complete client demonstration
├── tests/                   # Automated tests
│   └── test.sh              # Test suite for validation
├── run.sh                   # Quick start script
├── Dockerfile               # Docker container setup
├── docker-compose.yml       # Docker Compose configuration
├── package.json             # Node.js dependencies
└── README.md                # This documentation
```

## REST to SOAP Mapping

The following table shows how REST endpoints are mapped to SOAP operations:

| REST Endpoint | HTTP Method | SOAP Operation | Description |
|---------------|-------------|----------------|-------------|
| `/sessions` | POST | `Login` | Create session (login) |
| `/sessions` | DELETE | `Logout` | Delete session (logout) |
| `/users` | GET | `GetAllUsers` | Retrieve all users |
| `/users` | POST | `CreateUser` | Create new user |
| `/users/{id}` | GET | `GetUser` | Get user by ID |
| `/users/{id}` | PUT | `UpdateUser` | Full user update |
| `/users/{id}` | PATCH | `PartialUpdateUser` | Partial user update |
| `/users/{id}` | DELETE | `DeleteUser` | Delete user |
| `/articles` | GET | `GetAllArticles` | Retrieve all articles |
| `/articles` | POST | `CreateArticle` | Create new article |
| `/articles/{id}` | GET | `GetArticle` | Get article by ID |
| `/articles/{id}` | PUT | `UpdateArticle` | Full article update |
| `/articles/{id}` | PATCH | `PartialUpdateArticle` | Partial article update |
| `/articles/{id}` | DELETE | `DeleteArticle` | Delete article |
| `/tags` | GET | `GetAllTags` | Retrieve all tags |
| `/tags` | POST | `CreateTag` | Create new tag |
| `/tags/{id}` | GET | `GetTag` | Get tag by ID |
| `/tags/{id}` | PUT | `UpdateTag` | Full tag update |
| `/tags/{id}` | PATCH | `PartialUpdateTag` | Partial tag update |
| `/tags/{id}` | DELETE | `DeleteTag` | Delete tag |
| `/articles/{id}/tags` | GET | `GetArticleTags` | Get article's tags |
| `/articles/{id}/tags` | POST | `AddTagsToArticle` | Add tags to article |
| `/articles/{id}/tags` | DELETE | `RemoveTagsFromArticle` | Remove tags from article |

## Requirements

- **Node.js** 16.x or higher
- **npm** 6.x or higher
- **curl** (for testing)
- **Docker** (optional, for containerized deployment)

## Installation and Setup

### Option 1: Direct Node.js Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Eksisteeriva-REST-API-WSDL-SOAP-kloon
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   ./run.sh
   ```
   
   Or directly with npm:
   ```bash
   npm start
   ```

### Option 2: Docker Setup

1. **Using Docker Compose (recommended)**:
   ```bash
   docker-compose up --build
   ```

2. **Using Docker directly**:
   ```bash
   docker build -t medium-clone-soap .
   docker run -p 8080:8080 medium-clone-soap
   ```

## Usage

### Service Endpoints

- **SOAP Service**: `http://localhost:8080/soap`
- **WSDL Document**: `http://localhost:8080/soap?wsdl`
- **Health Check**: `http://localhost:8080/health`

### Client Example

Run the complete client demonstration:

```bash
node client/example.js
```

This will demonstrate all SOAP operations including:
- User authentication (login/logout)
- User management (create, read, update, delete)
- Article management (create, read, update, delete)
- Tag management (create, read, update, delete)
- Article-tag relationship management

### Sample SOAP Request

Here's an example of a Login operation:

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Login xmlns="http://example.com/medium-clone">
      <parameters>
        <email>john@example.com</email>
        <password>password123</password>
      </parameters>
    </Login>
  </soap:Body>
</soap:Envelope>
```

### Sample SOAP Response

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <LoginResponse xmlns="http://example.com/medium-clone">
      <parameters>
        <token>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</token>
        <user>
          <id>123e4567-e89b-12d3-a456-426614174000</id>
          <username>johndoe</username>
          <email>john@example.com</email>
          <bio>Software developer</bio>
          <avatar>https://example.com/avatar.jpg</avatar>
        </user>
      </parameters>
    </LoginResponse>
  </soap:Body>
</soap:Envelope>
```

## Testing

### Automated Test Suite

Run the complete test suite:

```bash
./tests/test.sh
```

The test suite validates:
- ✅ Server connectivity and health
- ✅ WSDL accessibility and XML validation
- ✅ All SOAP operations functionality
- ✅ REST vs SOAP functional equivalence
- ✅ Error handling and SOAP fault responses
- ✅ Data structure compliance with XSD schemas

### Manual Testing

1. **Check server health**:
   ```bash
   curl http://localhost:8080/health
   ```

2. **Verify WSDL accessibility**:
   ```bash
   curl http://localhost:8080/soap?wsdl
   ```

3. **Test SOAP operations**:
   ```bash
   node client/example.js
   ```

## Error Handling

The service implements comprehensive error handling with proper SOAP fault responses:

### Sample SOAP Fault

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>Client</faultcode>
      <faultstring>Invalid credentials</faultstring>
      <detail>User not found</detail>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>
```

### Fault Types

- **Client Faults**: Invalid input data, authentication failures, resource not found
- **Server Faults**: Internal server errors, database connection issues

## Data Models

### User
- `id`: Unique identifier (string)
- `username`: User's display name (string)
- `email`: User's email address (string)
- `password`: Encrypted password (string, optional in responses)
- `bio`: User biography (string)
- `avatar`: Avatar image URL (string)

### Article
- `id`: Unique identifier (string)
- `title`: Article title (string)
- `content`: Article content (string)
- `authorId`: Author's user ID (string)
- `createdAt`: Creation timestamp (ISO 8601 dateTime)
- `tags`: Associated tags (array of Tag objects)

### Tag
- `id`: Unique identifier (string)
- `name`: Tag name (string)
- `description`: Tag description (string)

## Security

- JWT token-based authentication
- Password hashing using bcrypt
- Input validation and sanitization
- SOAP fault responses for security errors
- Session management with token expiration

## Development

### Adding New Operations

1. **Update WSDL**: Add new message, operation, and binding definitions
2. **Implement Service**: Add the operation handler in `src/server.js`
3. **Update Client**: Add client method in `client/example.js`
4. **Add Tests**: Update test suite in `tests/test.sh`

### Code Structure

- **server.js**: Main SOAP service implementation with all operation handlers
- **medium-clone.wsdl**: Complete WSDL definition with XSD schemas
- **example.js**: Client library and demonstration
- **test.sh**: Comprehensive test suite

## Troubleshooting

### Common Issues

1. **Port 8080 already in use**:
   ```bash
   lsof -ti:8080 | xargs kill -9
   ```

2. **Dependencies not installed**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **WSDL not accessible**:
   - Ensure server is running: `curl http://localhost:8080/health`
   - Check firewall settings
   - Verify Node.js version compatibility

4. **SOAP client connection issues**:
   - Verify WSDL URL: `http://localhost:8080/soap?wsdl`
   - Check network connectivity
   - Ensure soap library is installed: `npm install soap`

### Debugging

Enable detailed logging:
```bash
DEBUG=soap* npm start
```

## Contributing

1. Follow the existing code structure and patterns
2. Update WSDL for any new operations
3. Add comprehensive tests for new features
4. Update documentation for any changes
5. Ensure SOAP fault handling for error conditions

## License

This project is licensed under the ISC License.

## REST API Reference

Original REST API repository: [lembitlindau/Medium-clone-API](https://github.com/lembitlindau/Medium-clone-API)

This SOAP implementation maintains functional equivalence with the original REST API while providing SOAP/WSDL interface standards.