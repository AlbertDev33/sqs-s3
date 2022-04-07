class Handler {
    async main(event) {
        try {
            return {
                statusCode: 200,
                body: 'hello'
            }
        } catch (err) {
            console.log('error', err.stack);
            return {
                statusCode: 500,
                body: 'Error'
            }
        }
    }
}

const handler = new Handler();
module.exports = handler.main.bind(handler);