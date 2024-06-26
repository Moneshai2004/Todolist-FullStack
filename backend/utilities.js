const jwt = require("jsonwebtoken")

function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

  jwt.verify(token, accessTokenSecret, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token

    req.user = user; // Save the user information to request object
    next(); // Pass control to the next middleware function
  });
}
module.exports = {
    authenticateToken
}