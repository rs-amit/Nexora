import http from "http";
import https from "https";
import { URL } from "url";

export const forwardRequest = (req, targetBase) => {
  return new Promise((resolve, reject) => {
    const targetUrl = new URL(
      req.originalUrl.replace("/api", ""),
      targetBase
    );

    const client =
      targetUrl.protocol === "https:"
        ? https
        : http;

    const headers = {
      ...req.headers,
    };

    delete headers.host;

    console.log("its working----2")

    // Inject authenticated user info
    if (req.user) {

      console.log("user",req.user )

      headers["x-user-id"] = req.user?.userId;
    }

    let body = null;

    if (
      req.body &&
      Object.keys(req.body).length > 0 &&
      req.method !== "GET"
    ) {
      body = JSON.stringify(req.body);

      headers["content-type"] =
        "application/json";

      headers["content-length"] =
        Buffer.byteLength(body);
    } else {
      delete headers["content-length"];
    }

    const options = {
      protocol: targetUrl.protocol,
      hostname: targetUrl.hostname,
      port: targetUrl.port,
      path:
        targetUrl.pathname +
        targetUrl.search,
      method: req.method,
      headers,
    };

    const proxyReq = client.request(
      options,
      (proxyRes) => {
        const chunks = [];

        proxyRes.on("data", (chunk) => {
          chunks.push(chunk);
        });

        proxyRes.on("end", () => {
          const buffer =
            Buffer.concat(chunks);

          resolve({
            status:
              proxyRes.statusCode || 500,
            headers:
              proxyRes.headers || {},
            data: buffer,
          });
        });
      }
    );

    proxyReq.on("error", (error) => {
      reject(error);
    });

    if (body) {
      proxyReq.write(body);
    }

    proxyReq.end();
  });
};