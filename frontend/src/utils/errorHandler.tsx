export const extractErrorMessage = (error: any): string => {
    // If error.response.data.error is an object, get the first error message
    if (error?.response?.data?.error && typeof error.response.data.error === 'object') {
        // Get all error messages from nested object
        const errorMessages = Object.values(error.response.data.error)
            .flat()
            .filter(message => message);
        
        return errorMessages[0] as string || 'An error occurred';
    }

    // If error.response.data.error is a string
    if (error?.response?.data?.error && typeof error.response.data.error === 'string') {
        return error.response.data.error;
    }

    // Default error message
    return 'An error occurred';
};