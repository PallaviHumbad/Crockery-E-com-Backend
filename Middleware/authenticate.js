import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
  const token = req.cookies.token; // Extract token from cookie

  console.log(token);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info (e.g., id) to request
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

export default authenticate;
