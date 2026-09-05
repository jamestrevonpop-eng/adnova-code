const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

require("dotenv").config();

const app = express();

const PORT =
  Number(
    process.env.PORT ||
    3001
  );


app.use(
  helmet({
    contentSecurityPolicy: false
  })
);


app.use(
  cors({
    origin: true,
    credentials: true
  })
);


app.use(
  express.json({
    limit: "10mb"
  })
);


app.use(
  express.static(
    path.join(
      __dirname,
      "..",
      "public"
    )
  )
);


app.get(
  "/api/health",
  (req, res) => {

    res.json({
      name:
        "Adnova Code",

      status:
        "online",

      version:
        "1.2.0"
    });

  }
);


app.get(
  "/api/plugin/health",
  (req, res) => {

    res.json({
      plugin:
        "Adnova Coding",

      service:
        "Adnova Code",

      status:
        "online",

      connected:
        false
    });

  }
);


app.post(
  "/api/plugin/prompt",
  (req, res) => {

    const {
      prompt = "",
      model = "adnova-5-sol",
      context = {},
      attachments = []
    } = req.body || {};


    if (
      typeof prompt !==
        "string" ||
      !prompt.trim()
    ) {

      return res.status(400).json({
        ok:
          false,

        error:
          "Prompt is required."
      });

    }


    res.json({
      ok:
        true,

      plugin:
        "Adnova Coding",

      service:
        "Adnova Code",

      model,

      received: {
        prompt,
        context,
        attachments
      }
    });

  }
);


app.post(
  "/api/plugin/context",
  (req, res) => {

    res.json({
      ok:
        true,

      ...req.body
    });

  }
);


app.listen(
  PORT,
  () => {

    console.log(
      `🚀 Adnova Code running on port ${PORT}`
    );

  }
);
