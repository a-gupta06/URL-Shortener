//jshint esversion:6
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const shortId = require("shortid");
const app = express();

mongoose.connect("mongodb+srv://arushi:arushi123@cluster0.iakjknz.mongodb.net/url", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
    console.log("We are connected");
});

const shortUrlSchema = new mongoose.Schema({
    full: {
        type: String,
        required: true,
    },
    short: {
        type: String,
        required: true,
        default: shortId.generate,
    },
    clicks: {
        type: Number,
        required: true,
        default: 0,
    },
});
const ShortUrl = mongoose.model("ShortUrl", shortUrlSchema);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.get("/", async(req, res) => {
    const shortUrls = await ShortUrl.find();
    res.render("index", { shortUrls: shortUrls });
});

app.post("/shortUrls", async(req, res) => {
    await ShortUrl.create({ full: req.body.fullUrl });

    res.redirect("/");
});

app.get("/:shortUrl", async(req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
    if (shortUrl == null) return res.sendStatus(404);

    shortUrl.clicks++;
    shortUrl.save();

    res.redirect(shortUrl.full);
});

app.listen(3000, function() {
    console.log("Server started on port 3000.");
});