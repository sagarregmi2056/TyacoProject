const User = require("../models/User");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

const { signupValidation, signinValidation } = require("../validator");

exports.signup = async (req, res) => {
  try {
    const { error } = signupValidation.validate(req.body);
    if (error) {
      let responseMessage = "";

      if (error.details[0].path.includes("name")) {
        responseMessage = "Please submit a valid name. ";
      }

      if (error.details[0].path.includes("address")) {
        responseMessage += "Please submit a address. ";
      }

      if (error.details[0].path.includes("email")) {
        responseMessage += "Please submit a valid email. ";
      }

      if (error.details[0].path.includes("phone")) {
        responseMessage += "Please submit a valid 10 digits phone number. ";
      }

      if (error.details[0].path.includes("password")) {
        responseMessage += "Please submit a  6 digits password. ";
      }

      return res.status(400).json({ error: error.details[0].message });
    }

    const userExists = await User.findOne({ email: req.body.email });

    if (userExists) {
      return res.status(403).json({ error: "Email is taken!" });
    }

    // Create a new user
    const newUser = new User(req.body);
    const user = await newUser.save();

    // Removing sensitive information
    user.salt = undefined;
    user.hashed_password = undefined;

    // res.json(user);
    res.json({ message: "User registration successful", userName: user.name });
  } catch (error) {
    // Handle unexpected errors
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.signin = async (req, res) => {
  try {
    // Validate the request body against the signin validation schema
    const { error } = signinValidation.validate(req.body);

    // If there's an error in validation, return a validation error response
    if (error) {
      let responseMessage = "";

      if (error.details[0].path.includes("email")) {
        responseMessage = "Please submit a valid email. ";
      }

      if (error.details[0].path.includes("password")) {
        responseMessage = "Please submit a valid password. ";
      }
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        error: "User with that email does not exist.",
      });
    }

    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Email and password do not match",
      });
    }

    const payload = {
      _id: user.id,
      name: user.name,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    return res.json({ _id: user.id, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.requireUserSignin = async (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    const user = parseToken(token);

    const founduser = await User.findById(user._id).select("name");

    if (founduser) {
      req.userauth = founduser;
      next();
    } else res.status(401).json({ error: "Not authorized!" });
  } else {
    res.status(401).json({ error: "Not authorized" });
  }
};
