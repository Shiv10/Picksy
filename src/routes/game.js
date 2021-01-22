import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
	res.render("game", { username: req.session.user.username, room: req.query.room });
});

export default router;
