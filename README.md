# Projeto para processamento de dados em massa com AWS SQS e S3

### Nesse projeto são utilizados os serviços S3 e SQS da AWS para processar arquivos sob demanda, utilizando stream's do Node.js

### Para executar esse projeto:
- Comando utilizado para subir o serviço do Localstack para testes locais;
    - docker-compose up -d localstack
- Para construir a imagem do app da aplicação;
    - docker-compose up --build app