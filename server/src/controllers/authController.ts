export {};
const User = require('../models/User');
const Devis = require('../models/Devis');

const AuthCode = require('../models/AuthCode');
const transporter = require('../utils/mailer');
const { generateCode } = require('../utils/codeGenerator');
const jwt = require('jsonwebtoken');



// Callback après authentification Google réussie
exports.googleCallback = async (req: { user: { email: any; exists: any; }; }, res: { redirect: (arg0: string) => void; }) => {
  const { email, exists } = req.user;

  if (!exists) {
    // Rediriger vers login si utilisateur non trouvé
    return res.redirect(`${process.env.URL_FRONTEND}/login?error=email_inexistant`);
  }

  try {
    const user = await User.findOne({ email });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.redirect(`${process.env.URL_FRONTEND}/dashboard?token=${token}`);
  } catch (err) {
    console.error('Erreur GoogleCallback :', err);
    res.redirect(`${process.env.URL_FRONTEND}/login?error=erreur_interne`);
  }
};

// Vérification de l'état de connexion Google
exports.googleSuccess = (req: { user: any; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): any; new(): any; }; }; json: (arg0: { message: string; user: any; }) => void; }) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Utilisateur non authentifié' });
  }

  res.json({ message: 'Connexion Google réussie', user: req.user });
};

// Déconnexion utilisateur
exports.logout = (req: { logout: (arg0: (err: any) => any) => void; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; }): any; new(): any; }; }; json: (arg0: { message: string; }) => void; }) => {
  req.logout(err => {
    if (err) return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
    res.json({ message: 'Déconnecté avec succès' });
  });
};

// Gestion des erreurs d’authentification Google
exports.failure = (_req: any, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): void; new(): any; }; }; }) => {
  res.status(401).json({ message: 'Échec de l’authentification' });
};

// Envoi du code d'authentification par email
exports.sendEmail = async (req: { body: { email: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: string; message?: string; }): void; new(): any; }; }; }) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'Email requis' });

  try {
    // Vérifie si l'utilisateur existe
    const userExists = await User.findOne({ email });

    if (!userExists) {
      return res.status(400).json({ message: 'Utilisateur non trouvé, veuillez vous inscrire' });
    }

    const code = generateCode();

    await AuthCode.create({ email, code });

    const mailOptions = {
      from: '"Mon App" <votre.email@gmail.com>',
      to: email,
      subject: 'Votre code d’authentification',
      text: `Votre code est : ${code}`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Code envoyé avec succès' });

  } catch (err) {
    console.error('Erreur envoi email:', err);
    res.status(500).json({ error: 'Échec d’envoi de l’email' });
  }
};


// Vérification du code reçu par email
exports.verifyEmail = async (req: { body: { email: any; code: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: string; message?: string; token?: any; user?: any; }): void; new(): any; }; }; }) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email et code requis' });
  }

  try {
    const authCode = await AuthCode.findOne({ email, code });

    if (!authCode) {
      return res.status(400).json({ error: 'Code invalide ou expiré' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé, veuillez vous inscrire' });
    }

    user.isVerified = true;
    await user.save();

    await AuthCode.deleteMany({ email });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ message: 'Utilisateur vérifié et connecté', token, user });

  } catch (err) {
    console.error('Erreur lors de la vérification:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

// enregister utilisateur 
exports.registerUser = async (req: { body: { email: any; nom: any; prenom: any; telephone: any; genre: any; dateNaissance: any; couverture: any; regimeSocial: any; codePostal: any; dateDebutAssurance: any; typeCouverture: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: string; message?: string; user?: any; }): void; new(): any; }; }; }) => {
  const {
    email,
    nom,
    prenom,
    telephone,
    genre,
    dateNaissance,
    couverture,
    regimeSocial,
    codePostal,
    dateDebutAssurance,
    typeCouverture 
  } = req.body;

  if (!email || !nom || !prenom) {
    return res.status(400).json({ error: 'Email, nom et prénom sont requis.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Cet utilisateur existe déjà.' });
    }

    const newUser = new User({
      email,
      nom,
      prenom,
      telephone,
      genre,
      dateNaissance,
      couverture,
      regimeSocial,
      codePostal,
      dateDebutAssurance,
      typeCouverture,
      isVerified: true,  
    });

    await newUser.save();

    res.status(201).json({ message: 'Utilisateur enregistré avec succès', user: newUser });
  } catch (err) {
    console.error('Erreur lors de l’enregistrement:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Vérification du code reçu par email
exports.profileUser = async (req: { params: { id: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; error?: any; }): void; new(): any; }; }; json: (arg0: any) => void; }) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } 
  catch (error) {
    const err = error as Error;
    res.status(500).json({
      message: 'Erreur serveur',
      error: err.message
    });
  }
  
}; 

exports.getAuthenticatedUser = (req: { user: any; }, res: { json: (arg0: any) => void; }) => {
  res.json(req.user);
};

exports.updateUser = async (req: { params: { id: any; }; body: any; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): any; new(): any; }; }; }) => {
  const { id } = req.params;
  const updateFields = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, updateFields, {
      new: true, 
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error('Erreur lors de la mise à jour du profil:', err);
    return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour.' });
  }
};

exports.deleteUserAndDevis = async (req: { params: { id: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; deletedUser?: any; deletedDevisCount?: any; }): any; new(): any; }; }; }) => {
  const userId = req.params.id;

  try {
    // 1. Récupérer l'utilisateur pour obtenir son email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const userEmail = user.email;

    // 2. Supprimer les devis contenant cet email
    const devisResult = await Devis.deleteMany({ email: userEmail });

    // 3. Supprimer l'utilisateur
    const userResult = await User.findByIdAndDelete(userId);

    return res.status(200).json({
      message: "Utilisateur et devis associés supprimés avec succès.",
      deletedUser: userResult,
      deletedDevisCount: devisResult.deletedCount,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};