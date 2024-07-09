const authRole = require("../authRole");

router.get(
  "/users",
  authRole(["Admin", "Moderator", "User"]),
  async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
      const users = await User.find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);
