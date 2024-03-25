require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const BodyParser = require("body-parser");
const DNS = require("dns");

// configuring data for POST methods
app.use(
  BodyParser.urlencoded({
    extended: false,
  })
);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Global var
const urls = [];
let currentId = 0;

// error msg
const errorMsg = {
  error: "invalid url",
};

// exercise endpoint
app.post("/api/shorturl", function (req, res) {
  const url = req.body.url;

  if (url === "") {
    return res.json(errorMsg);
  }
  let parsed_url;
  const modified_url = url.replace(
    /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,
    ""
  );

  try {
    parsed_url = new URL(url);
  } catch (err) {
    return res.json(errorMsg);
  }

  DNS.lookup(modified_url, (err) => {
    if (err) {
      return res.json(errorMsg);
    } else {
      const link_exists = urls.find((l) => l.original_url === url);

      if (link_exists) {
        return res.json({
          original_url: url,
          short_url: currentId,
        });
      } else {
        // increment for each new valid url
        ++currentId;

        // object creation for entry into url
        const url_object = {
          original_url: url,
          short_url: `${currentId}`,
        };

        // pushing each new entry into the array
        urls.push(url_object);

        // return the new entry created
        return res.json({
          original_url: url,
          short_url: currentId,
        });
      }
    }
  });
});

// get request to navigate to the url
app.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id;

  // finding if the id already exists
  const short_link = urls.find((sl) => sl.short_url === id);

  if (short_link) {
    return res.redirect(short_link.original_url);
  } else {
    return res.json(errorMsg);
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
