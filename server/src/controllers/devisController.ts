export {};
const Devis = require('../models/Devis');
const User = require('../models/User');
const transporter = require('../utils/mailer');
const getDevisEmailHTML = require('../emailTemplates/devisTemplate'); // 👈 Import du template

// CREATE
exports.createDevis = async (req: { body: { [x: string]: any; email: any; nom: any; prenom: any; telephone: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message?: string; devis?: any; error?: string; }): any; new(): any; }; }; }) => {
  try {
    const { email, nom, prenom, telephone, ...devisData } = req.body;

    // Rechercher si l'utilisateur existe déjà
    let user = await User.findOne({ email });

    if (!user) {
      // Créer un nouvel utilisateur
      user = await User.create({ email, nom, prenom, telephone });
    }

    // Créer le devis
    const devis = await Devis.create({
      ...devisData,
      email,
      nom,
      prenom,
      telephone
    });

    return res.status(201).json({ message: 'Devis enregistré avec succès.', devis });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur serveur lors de l'enregistrement du devis." });
  }
};

// READ ALL
exports.getAllDevis = async (req: any, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: any; }): void; new(): any; }; }; }) => {
  try {
    const allDevis = await Devis.find();
    res.status(200).json(allDevis);
  }
  catch (error) {
    const err = error as Error;

    // Définir un type explicite de réponse JSON
    type ErrorResponse = {
      message: string;
      error: string;
    };

    res.status(500).json({
      message: 'Erreur serveur',
      error: err.message
    } as ErrorResponse);
  }
};

// READ ONE
exports.getDevisById = async (req: { params: { id: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: any; }): void; new(): any; }; }; }) => {
  try {
    const devis = await Devis.findById(req.params.id);
    if (!devis) return res.status(404).json({ error: 'Devis not found' });
    res.status(200).json(devis);
  } catch (error) {
    const err = error as Error;

    // Définir un type explicite de réponse JSON
    type ErrorResponse = {
      message: string;
      error: string;
    };

    res.status(500).json({
      message: 'Erreur serveur',
      error: err.message
    } as ErrorResponse);
  }
};

// UPDATE
exports.updateDevis = async (req: { params: { id: any; }; body: any; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: any; }): void; new(): any; }; }; }) => {
  try {
    const updatedDevis = await Devis.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.status(200).json(updatedDevis);
  } catch (error) {
    const err = error as Error;

    // Définir un type explicite de réponse JSON
    type ErrorResponse = {
      message: string;
      error: string;
    };

    res.status(500).json({
      message: 'Erreur serveur',
      error: err.message
    } as ErrorResponse);
  }
};

// DELETE
exports.deleteDevis = async (req: { params: { id: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message?: string; error?: any; }): void; new(): any; }; }; }) => {
  try {
    await Devis.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Devis deleted successfully' });
  } catch (error) {
    const err = error as Error;

    // Définir un type explicite de réponse JSON
    type ErrorResponse = {
      message: string;
      error: string;
    };

    res.status(500).json({
      message: 'Erreur serveur',
      error: err.message
    } as ErrorResponse);
  }
};
// Get all Devis selon category
exports.getDevisByCategoryEmail = async (req: { query: { categories: any; email: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message?: string; error?: any; }): void; new(): any; }; }; }) => {
  try {
    const { categories, email } = req.query; 

    if (!email || !categories) {
      return res.status(400).json({ message: 'Email ou catégorie manquant dans les paramètres de requête' });
    }

    const devis = await Devis.find({ categories, email });
    res.status(200).json(devis);
  } catch (error) {
    const err = error as Error;

    // Définir un type explicite de réponse JSON
    type ErrorResponse = {
      message: string;
      error: string;
    };

    res.status(500).json({
      message: 'Erreur serveur',
      error: err.message
    } as ErrorResponse);
  }
};


const sendStyledEmail = async (recipient: any, name: any, link: any) => {
  const htmlContent = getDevisEmailHTML(name, link); // 👈 Appel du template dynamique

  await transporter.sendMail({
    from: '"MonApp Santé" <no-reply@monapp.com>',
    to: recipient,
    subject: "Votre offre santé personnalisée",
    html: htmlContent,
  });
};


exports.sendMailDevis =  async (req: { body: { email: any; name: any; link: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): void; new(): any; }; }; }) => {
  const { email, name, link } = req.body;
  try {
    await sendStyledEmail(email, name, link);
    res.status(200).send("Email envoyé !");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de l'envoi de l'email");
  }
};  