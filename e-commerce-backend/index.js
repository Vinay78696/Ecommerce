const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config();
app.use(express.json());
app.use(cors());

const MONGO_URL = process.env.MONGO_URL || "Your mongo connection String";
const secret_admin_key = process.env.JWT_SECRET || "Your secret key"
// Database Connection With MongoDB
mongoose.connect(MONGO_URL);

//Image Storage Engine
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    console.log(file);
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
//uploasd function
const upload = multer({ storage: storage });
app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:4000/images/${req.file.filename}`,
  });
});
app.use("/images", express.static("upload/images"));

// MiddleWare to fetch user from database
const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, "secret_admin_key");
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};

// Schema for creating user model
const Users = mongoose.model("Users", {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Schema for creating Product
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
  },
  old_price: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  avilable: {
    type: Boolean,
    default: true,
  },
});

//admin model
const Admin = mongoose.model("Admin", {
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

app.get("/", (req, res) => {
  res.send("Root");
});

//End Point for Login
app.post("/login", async (req, res) => {
  console.log("Login");
  let success = false;
  let user = await Users.findOne({ email: req.body.email });

  if (user) {
    // Compare the provided password with the stored hashed password
    const passCompare = await bcrypt.compare(req.body.password, user.password);

    if (passCompare) {
      const data = {
        user: {
          id: user.id,
        },
      };
      success = true;
      console.log(user.id);

      // Generate token
      const token = jwt.sign(data, secret_admin_key, { expiresIn: "1h" });
      res.json({ success, token });
    } else {
      return res.status(400).json({
        success: success,
        errors: "Please try with correct email/password",
      });
    }
  } else {
    return res.status(400).json({
      success: success,
      errors: "Please try with correct email/password",
    });
  }
});

// Endpoint for signup (register user)
app.post("/signup", async (req, res) => {
  console.log("Sign Up");
  let success = false;
  let check = await Users.findOne({ email: req.body.email });

  if (check) {
    return res.status(400).json({
      success: success,
      errors: "Existing user found with this email",
    });
  }

  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }

  // Hash the password before saving it
  const hashedPassword = await bcrypt.hash(req.body.password, 10); // 10 is the salt rounds

  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: hashedPassword, // Save the hashed password
    cartData: cart,
  });

  await user.save();

  const data = {
    user: {
      id: user.id,
    },
  };
  const token = jwt.sign(data, secret_admin_key, { expiresIn: "1h" });
  success = true;
  res.json({ success, token });
});

//admin signup
app.post("/admin/signup", async (req, res) => {
  console.log("Admin Signup");
  let success = false;
  // console.log(req);
  try {
    // Check if the email already exists
    let existingAdmin = await Admin.findOne({ email: req.body.email });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ success, error: "Admin with this email already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create new Admin
    const admin = new Admin({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    await admin.save();

    // Generate JWT token
    const data = { admin: { id: admin.id } };
    const token = jwt.sign(data, secret_admin_key, { expiresIn: "1h" });

    success = true;
    res.json({ success, token });
  } catch (error) {
    console.log("Error during admin signup:", error);
    res.status(500).json({ success, error: "Internal Server Error" });
  }
});

// Admin Login Endpoint
app.post("/admin/login", async (req, res) => {
  console.log("Admin Login");
  let success = false;

  try {
    // Check if the email exists
    let admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
      return res
        .status(400)
        .json({ success, error: "Invalid email or password." });
    }

    // Compare the provided password with the stored hashed password
    const passCompare = await bcrypt.compare(req.body.password, admin.password);
    if (!passCompare) {
      return res
        .status(400)
        .json({ success, error: "Invalid email or password." });
    }

    // Generate JWT token
    const data = { admin: { id: admin.id } };
    const token = jwt.sign(data, secret_admin_key, { expiresIn: "1h" });

    success = true;
    res.json({ success, token });
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ success, error: "Internal Server Error" });
  }
});

app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  console.log("All Products");
  res.send(products);
});

app.get("/newcollections", async (req, res) => {
  let products = await Product.find({});
  let arr = products.slice(1).slice(-8);
  console.log("New Collections");
  res.send(arr);
});

app.get("/popularinwomen", async (req, res) => {
  let products = await Product.find({ category: { $regex: /^women$/i } });
  let arr = products.splice(0, 4);
  console.log("Popular In Women");
  res.send(arr);
});

//Create an endpoint for saving the product in cart
app.post("/addtocart", fetchuser, async (req, res) => {
  console.log("Add Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  userData.cartData[req.body.itemId] += 1;
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send("Added");
});

//Create an endpoint for saving the product in cart
app.post("/removefromcart", fetchuser, async (req, res) => {
  console.log("Remove Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] != 0) {
    userData.cartData[req.body.itemId] -= 1;
  }
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send("Removed");
});

//Create an endpoint for saving the product in cart
app.post("/getcart", fetchuser, async (req, res) => {
  console.log("Get Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  res.json(userData.cartData);
});

app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  } else {
    id = 1;
  }
  const product = new Product({
    id: id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  console.log(product);
  await product.save();
  console.log("Saved");
  res.json({ success: true, name: req.body.name });
});

app.post("/removeproduct", async (req, res) => {
  const product = await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({ success: true, name: req.body.name });
});

app.listen(port, (error) => {
  if (!error) console.log("Server Running on port " + port);
  else console.log("Error : ", error);
});