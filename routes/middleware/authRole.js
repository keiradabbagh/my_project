const jwt = require("jsonwebtoken");
<<<<<<< Updated upstream
const User = require("../models/User");
=======
const User = require("../../models/User");
const authRole = require("../../authRole");
>>>>>>> Stashed changes

function authRole(role) {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (role.includes(user.role)) {
        req.user = user;
        next();
      } else {
        res.status(403).send("Access denied");
      }
    } catch (error) {
      res.status(401).send("Invalid token");
    }
  };
}

module.exports = authRole;
