import express from "express";
// import passport from "passport";

const router = express.Router();

// Configure Properly for local


// router.get("/local", passport.authenticate("local", { scope: ["email profile"] }));

// router.get("/local/callback", passport.authenticate("local", { failureRedirect: "/" }), (req, res) => {
// // Authenticated successfully
// res.redirect("/home");
// });

// router.get("/logout", (req, res) => {
// req.logout();
// res.redirect("/");
// });

export default router;
