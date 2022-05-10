import httpProxy from "http-proxy";
import Cookies from "cookies";
import url from "url";

const API_URL = "http://localhost:8000";
const proxy = httpProxy.createProxyServer();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default (req, res) => {
  return new Promise((resolve, reject) => {
    const pathname = url.parse(req.url).pathname;
    const isLogin = pathname === "/api/token";

    const cookies = new Cookies(req, res);
    const authToken = cookies.get("auth-token");

    req.url = req.url.replace(/^\/api/, "");

    req.headers.cookie = "";

    if (authToken) {
      req.headers["Authorization"] = `Bearer ${authToken}`;
    }

    if (isLogin) {
      proxy.once("proxyRes", interceptLoginResponse);
    }

    proxy.once("error", reject);

    proxy.web(req, res, {
      target: API_URL,
      autoRewrite: false,
      selfHandleResponse: isLogin,
    });

    const interceptLoginResponse = (proxyRes, req, res) => {
      let apiResponseBody = "";
      proxyRes.on("data", (chunk) => {
        apiResponseBody += chunk;
      });

      proxyRes.on("end", () => {
        try {
          const {token} = JSON.parse(apiResponseBody);

          const cookies = new Cookies(req, res);
          cookies.set("auth-token", token, {
            httpOnly: true,
            sameSite: "lax",
          });

          res.status(200).json({loggedIn: true});
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    };
  });
};
