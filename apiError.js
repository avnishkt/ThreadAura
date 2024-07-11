class apiError extends Error{
    constructor(message, explanation) {
        // Call the parent class constructor (Error)
        super(message);

        // Set the name of the error class
        this.name = 'AppError';

        // Set the error message
        this.message = message || 'An error occurred';

        // Set the explanation (additional details about the error)
        this.explanation = explanation || 'No additional explanation provided';

        // Set the status code associated with the error
    }
}
module.exports=apiError;