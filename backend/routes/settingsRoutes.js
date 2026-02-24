const express = require("express");
const router = express.Router();
const Settings = require("../models/Settings");

router.get("/", async (req, res) => {
    try {
        const settings = await Settings.findOne();
        if (!settings) {
            return res.json({ emailUser: "", emailPass: "" });
        }
        res.json(settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.post("/", async (req, res) => {
    const { emailUser, emailPass } = req.body;

    try {
        let settings = await Settings.findOne();

        if (settings) {
            settings.emailUser = emailUser;
            settings.emailPass = emailPass;
            settings.updatedAt = Date.now();
            await settings.save();
        } else {
            settings = new Settings({ emailUser, emailPass });
            await settings.save();
        }

        res.json({ msg: "Settings saved successfully", settings });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
