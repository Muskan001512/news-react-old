// middlewares/Userauth.js
import jwt from 'jsonwebtoken';
import User from '../api/model/user.js';


const verifyToken = (req, res, next) => {
 const token =
			req.cookies?.accessToken ||
			req.header("Authorization")?.replace("Bearer ", "");
      console.log(req.cookies.accessToken );
		if (!token) {
      res.status(401).send('Unauthorized request');
		} else if (typeof token !== "string") {
			
      res.status(401).send('Invalid token format');
		}

  try {
    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role !== 'admin') {
      return res.status(403).send('Access Denied');
    }
    next();
  } catch (err) {
    res.status(400).send('Invalid Request');
  }
};

export { verifyToken, isAdmin };

