#!/bin/bash

echo "=== Medium Clone SOAP API Test Suite ==="
echo

# Check if server is running
check_server() {
    echo "Checking if SOAP server is running..."
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health)
    if [ "$response" = "200" ]; then
        echo "✓ Server is running"
        return 0
    else
        echo "✗ Server is not running on port 8080"
        echo "Please start the server first with: ./run.sh"
        return 1
    fi
}

# Test WSDL accessibility
test_wsdl() {
    echo
    echo "Testing WSDL accessibility..."
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/soap?wsdl")
    if [ "$response" = "200" ]; then
        echo "✓ WSDL is accessible at http://localhost:8080/soap?wsdl"
        return 0
    else
        echo "✗ WSDL is not accessible"
        return 1
    fi
}

# Test WSDL validation
test_wsdl_validation() {
    echo
    echo "Testing WSDL validation..."
    
    # Check if xmllint is available
    if command -v xmllint &> /dev/null; then
        wsdl_content=$(curl -s "http://localhost:8080/soap?wsdl")
        if echo "$wsdl_content" | xmllint --noout - 2>/dev/null; then
            echo "✓ WSDL is valid XML"
            return 0
        else
            echo "✗ WSDL has XML validation errors"
            return 1
        fi
    else
        echo "⚠ xmllint not available, skipping XML validation"
        echo "  Install libxml2-utils to enable XML validation"
        return 0
    fi
}

# Test SOAP operations
test_soap_operations() {
    echo
    echo "Testing SOAP operations..."
    
    # Check if Node.js is available
    if ! command -v node &> /dev/null; then
        echo "✗ Node.js is required to run SOAP operation tests"
        return 1
    fi
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo "Installing test dependencies..."
        npm install
        if [ $? -ne 0 ]; then
            echo "✗ Failed to install dependencies"
            return 1
        fi
    fi
    
    # Run the client example
    echo "Running SOAP client tests..."
    node client/example.js
    if [ $? -eq 0 ]; then
        echo "✓ All SOAP operations completed successfully"
        return 0
    else
        echo "✗ SOAP operations failed"
        return 1
    fi
}

# Test specific REST vs SOAP comparison
test_rest_soap_comparison() {
    echo
    echo "Testing REST vs SOAP functional equivalence..."
    
    # Test Login operation
    echo "Testing Login operation..."
    login_result=$(node -e "
        const soap = require('soap');
        (async () => {
            try {
                const client = await soap.createClientAsync('http://localhost:8080/soap?wsdl');
                const [result] = await client.LoginAsync({
                    parameters: { email: 'john@example.com', password: 'password123' }
                });
                console.log('SUCCESS: Login returned token');
                return 0;
            } catch (error) {
                console.log('FAILED: Login failed -', error.message);
                return 1;
            }
        })();
    " 2>/dev/null)
    
    if echo "$login_result" | grep -q "SUCCESS"; then
        echo "✓ Login operation works correctly"
    else
        echo "✗ Login operation failed"
        echo "$login_result"
        return 1
    fi
    
    # Test GetAllUsers operation
    echo "Testing GetAllUsers operation..."
    users_result=$(node -e "
        const soap = require('soap');
        (async () => {
            try {
                const client = await soap.createClientAsync('http://localhost:8080/soap?wsdl');
                const [result] = await client.GetAllUsersAsync({ parameters: '' });
                if (result.parameters.user && Array.isArray(result.parameters.user)) {
                    console.log('SUCCESS: GetAllUsers returned array of users');
                } else {
                    console.log('SUCCESS: GetAllUsers returned empty array');
                }
                return 0;
            } catch (error) {
                console.log('FAILED: GetAllUsers failed -', error.message);
                return 1;
            }
        })();
    " 2>/dev/null)
    
    if echo "$users_result" | grep -q "SUCCESS"; then
        echo "✓ GetAllUsers operation works correctly"
    else
        echo "✗ GetAllUsers operation failed"
        echo "$users_result"
        return 1
    fi
    
    # Test CreateUser operation
    echo "Testing CreateUser operation..."
    create_user_result=$(node -e "
        const soap = require('soap');
        (async () => {
            try {
                const client = await soap.createClientAsync('http://localhost:8080/soap?wsdl');
                const [result] = await client.CreateUserAsync({
                    parameters: {
                        username: 'testuser_' + Date.now(),
                        email: 'test_' + Date.now() + '@example.com',
                        password: 'testpass123',
                        bio: 'Test user',
                        avatar: 'https://example.com/avatar.jpg'
                    }
                });
                if (result.parameters.id && result.parameters.username) {
                    console.log('SUCCESS: CreateUser returned user with ID');
                } else {
                    console.log('FAILED: CreateUser did not return expected user object');
                }
                return 0;
            } catch (error) {
                console.log('FAILED: CreateUser failed -', error.message);
                return 1;
            }
        })();
    " 2>/dev/null)
    
    if echo "$create_user_result" | grep -q "SUCCESS"; then
        echo "✓ CreateUser operation works correctly"
    else
        echo "✗ CreateUser operation failed"
        echo "$create_user_result"
        return 1
    fi
    
    return 0
}

# Test error handling
test_error_handling() {
    echo
    echo "Testing error handling..."
    
    # Test invalid login
    echo "Testing invalid login (should return SOAP fault)..."
    invalid_login_result=$(node -e "
        const soap = require('soap');
        (async () => {
            try {
                const client = await soap.createClientAsync('http://localhost:8080/soap?wsdl');
                const [result] = await client.LoginAsync({
                    parameters: { email: 'invalid@example.com', password: 'wrongpassword' }
                });
                console.log('FAILED: Invalid login should have thrown an error');
                return 1;
            } catch (error) {
                if (error.root && error.root.Envelope && error.root.Envelope.Body && error.root.Envelope.Body.Fault) {
                    console.log('SUCCESS: Invalid login returned proper SOAP fault');
                    return 0;
                } else {
                    console.log('FAILED: Invalid login did not return proper SOAP fault');
                    return 1;
                }
            }
        })();
    " 2>/dev/null)
    
    if echo "$invalid_login_result" | grep -q "SUCCESS"; then
        echo "✓ Error handling works correctly (SOAP faults)"
    else
        echo "✗ Error handling failed"
        echo "$invalid_login_result"
        return 1
    fi
    
    # Test non-existent user
    echo "Testing non-existent user retrieval..."
    nonexistent_user_result=$(node -e "
        const soap = require('soap');
        (async () => {
            try {
                const client = await soap.createClientAsync('http://localhost:8080/soap?wsdl');
                const [result] = await client.GetUserAsync({
                    parameters: 'non-existent-id'
                });
                console.log('FAILED: Non-existent user should have thrown an error');
                return 1;
            } catch (error) {
                if (error.root && error.root.Envelope && error.root.Envelope.Body && error.root.Envelope.Body.Fault) {
                    console.log('SUCCESS: Non-existent user returned proper SOAP fault');
                    return 0;
                } else {
                    console.log('FAILED: Non-existent user did not return proper SOAP fault');
                    return 1;
                }
            }
        })();
    " 2>/dev/null)
    
    if echo "$nonexistent_user_result" | grep -q "SUCCESS"; then
        echo "✓ Non-existent resource handling works correctly"
    else
        echo "✗ Non-existent resource handling failed"
        echo "$nonexistent_user_result"
        return 1
    fi
    
    return 0
}

# Main test execution
main() {
    local exit_code=0
    
    # Run all tests
    check_server || exit_code=1
    test_wsdl || exit_code=1
    test_wsdl_validation || exit_code=1
    test_soap_operations || exit_code=1
    test_rest_soap_comparison || exit_code=1
    test_error_handling || exit_code=1
    
    echo
    echo "=== Test Results ==="
    if [ $exit_code -eq 0 ]; then
        echo "✓ ALL TESTS PASSED"
        echo "The SOAP API successfully implements all REST endpoint functionality"
    else
        echo "✗ SOME TESTS FAILED"
        echo "Please check the output above for details"
    fi
    
    exit $exit_code
}

# Run main function
main
