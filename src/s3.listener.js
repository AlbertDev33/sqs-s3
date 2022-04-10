const AWS = require('aws-sdk');
const { Writable, pipeline } = require('stream');
const csvToJson = require('csvtojson');

class Handler {
    constructor({ s3Svc, sqsSvc }) {
        this.s3Svc = s3Svc;
        this.sqsSvc = sqsSvc;
        this.queueName = process.env.SQS_QUEUE;
    }

    static getSdks() {
        const host = process.env.LOCALSTACK_HOST || 'localhost';
        const s3Port = process.env.S3_PORT || '4566';
        const sqsPort = process.env.SQS_PORT || '4566';
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

    async getQueueUrl() {
        const { QueueUrl } = await this.sqsSvc.getQueueUrl({
            QueueName: this.queueName
        }).promise();
        return QueueUrl;
    }

    processDataOnDemand(queueUrl) {
        const writableStream = new Writable({
            write: (chunk, encoding, done) => {
                const item = chunk.toString();
                console.log('received', item);
                this.sqsSvc.sendMessage({
                    QueueUrl: queueUrl,
                    MessageBody: item
                }, done);
            }
        });
        return writableStream;
    }

    async pipefyStream(...args) {
        return new Promise((resolve, reject) => {
            pipeline(
                ...args,
                err => err ? reject(err) : resolve()
            )
        });
    }

    async main(event) {
        const [{ s3 }] = event.Records;
        const {
            bucket: { name },
            object: { key }
        } = s3;

        try {
            const queueUrl = await this.getQueueUrl();
            const params = {
                Bucket: name,
                Key: key
            };

            await this.pipefyStream(
                this.s3Svc
                    .getObject(params)
                    .createReadStream(),
                csvToJson(),
                this.processDataOnDemand(queueUrl)
            );

            console.log('process finished...', new Date().toISOString());

            return {
                statusCode: 200,
                body: 'Process finisheed with success!'
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