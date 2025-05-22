const validateEmail = (email) => {
    // Regular expression for email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    
    // Check if email matches the regex pattern
    if (!emailRegex.test(email)) {
        return {
            isValid: false,
            message: "Please enter a valid email address (e.g., example@domain.com)"
        };
    }

    // Check for common disposable email domains
    const disposableDomains = [
        'tempmail.com',
        'throwawaymail.com',
        'mailinator.com',
        'guerrillamail.com',
        'sharklasers.com',
        'yopmail.com',
        'temp-mail.org',
        'fakeinbox.com',
        'tempinbox.com',
        'tempmail.net'
    ];

    const domain = email.split('@')[1].toLowerCase();
    if (disposableDomains.includes(domain)) {
        return {
            isValid: false,
            message: "Please use a valid email address. Disposable email addresses are not allowed."
        };
    }

    return {
        isValid: true,
        message: "Email is valid"
    };
};

module.exports = { validateEmail }; 