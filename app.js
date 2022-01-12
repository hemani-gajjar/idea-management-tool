const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://admin-hemani:bujo-admin0987@cluster0.axslz.mongodb.net/ideaDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

//to remove the deprecation warnings
mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", false);

//defining a mongoose Schema for individual highlights
const highlightSchema = {
  title: String,
  content: String,
  memberName: String,
};

//Mongoose model based on the highlightSchema
const Highlight = mongoose.model("Highlight", highlightSchema);

//defining a mongoose Schema for the buckets
const bucketSchema = {
  name: String,
  highlights: [highlightSchema],
};

//Mongoose model based on the bucketSchema
const Bucket = mongoose.model("Bucket", bucketSchema);

app.get("/", function (req, res) {
  Bucket.find({}, function (err, buckets) {
    if (!err) {
      console.log(buckets);
      res.render("home", { bucketArray: buckets });
    }
  });
  // res.render("home", {});
});

app.get("/new-bucket", function (req, res) {
  res.render("new-bucket");
});

app.post("/new-bucket", function (req, res) {
  //new bucket
  const newBucket = new Bucket({
    name: req.body.bucketName,
  });

  newBucket.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.get("/buckets/:bucketId", function (req, res) {
  const requestedBucketId = req.params.bucketId;

  Bucket.findOne({ _id: requestedBucketId }, function (err, foundBucket) {
    res.render("bucket", {
      foundBucket: foundBucket,
      bucketId: requestedBucketId,
    });
  });
});

app.get("/buckets/:bucketId/new-highlight", function (req, res) {
  const requestedBucketId = req.params.bucketId;
  res.render("compose", { bucketId: requestedBucketId });
});

app.post("/buckets/:bucketId/new-highlight", function (req, res) {
  const requestedBucketId = req.params.bucketId;

  const newHighlight = new Highlight({
    title: req.body.highlightTitle,
    content: req.body.highlightContent,
    memberName: req.body.memberName,
  });

  Bucket.findOneAndUpdate(
    { _id: requestedBucketId },
    { $push: { highlights: newHighlight } },
    function (err) {
      if (!err) {
        res.redirect(`/buckets/${requestedBucketId}`);
      } else {
        console.log(err);
      }
    }
  );
});

app.post("/:bucketId/delete", function (req, res) {
  const requestedBucketId = req.body.bucketId;
  const deleteButtonId = req.body.deleteButton;
  Bucket.findOneAndUpdate(
    { _id: requestedBucketId },
    { $pull: { highlights: { _id: deleteButtonId } } },
    function (err) {
      if (!err) {
        res.redirect(`/`);
      }
    }
  );
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server started");
});
