const AWS = require('aws-sdk');

class Handler {
    constructor({ s3Svc, sqsSvc }) {
        this.s3Svc = s3Svc;
        this.sqsSvc = sqsSvc;
    }

    static getSdks() {
        const host = process.env.LOCALSTACK_HOST || 'localhost';
        const s3Port = process.env.S3_PORT || '4566';
        const sqsPort = process.env.SQS_PORT || '4576';
        const isLocal = process.env.IS_LOCAL;
        const s3Endpoint = new AWS.Endpoint(
            `http://${host}:${s3Port}`
        );
        const s3Config = {
            endpoint: s3Endpoint,
            s3ForcePathStyle: true
        };

        const sqsEndpoint = new AWS.Endpoint(
            `http://${host}:${sqsPort}`
        );
        const sqsConfig = {
            endpoint: sqsEndpoint
        }

        if (!isLocal) {
            delete s3Config.endpoint,
            delete sqsConfig.endpoint
        }

        return {
            s3: new AWS.S3(s3Config),
            sqs: new AWS.SQS(sqsConfig)
        }
    }

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
const { s3, sqs } = Handler.getSdks();
const handler = new Handler({
    s3Svc: s3,
    sqsSvc: sqs
});
module.exports = handler.main.bind(handler);