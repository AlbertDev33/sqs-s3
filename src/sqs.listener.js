class Handler {
    async main(event) {
        console.log('event', JSON.stringify(event, null, 2));
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