const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

router.get("/preferences", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user.preferences);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.put("/preferences", auth, async (req, res) => {
    const { theme } = req.body;

    try {
        let user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        if (theme) {
            user.preferences.theme = theme;
        }

        await user.save();
        res.json(user.preferences);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
