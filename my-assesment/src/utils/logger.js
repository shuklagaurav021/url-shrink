const pino = require('pino');

const excludeFields = ['req.headers.authorization'];

const requestSerializer = (req) => {
  const serializedReq = pino.stdSerializers.req(req);
  serializedReq.body = req.body;
  return serializedReq;
};

const responseSerializer = (res) => {
  const serializedRes = pino.stdSerializers.res(res);
  serializedRes.body = res.body;
  return serializedRes;
};

const logger = pino(
  {
    name: process.env.SERVICE_NAME,
    level: 'debug',
    base: null,
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: excludeFields,
      censor: '***',
    },
    serializers: {
      req: requestSerializer,
      res: responseSerializer,
    },
  }
);

module.exports = logger;