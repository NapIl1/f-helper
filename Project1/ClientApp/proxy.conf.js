const { env } = require("process");

const target = env.ASPNETCORE_HTTPS_PORT
  ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}/api`
  : env.ASPNETCORE_URLS
  ? env.ASPNETCORE_URLS.split(";")[0]
  : "https://fpv-training-location.ambitioussmoke-69ddee54.westeurope.azurecontainerapps.io/";

const PROXY_CONFIG = [
  {
    context: ["/options"],
    proxyTimeout: 10000,
    target: target,
    secure: false,
    headers: {
      Connection: "Keep-Alive",
    },
  },
];

module.exports = PROXY_CONFIG;
