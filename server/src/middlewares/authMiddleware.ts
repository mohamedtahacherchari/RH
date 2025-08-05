const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.verifyToken = async (req: { headers: { authorization: string; }; user: any; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): any; new(): any; }; }; }, next: () => void) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token manquant" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token invalide" });
  }
}; 



  