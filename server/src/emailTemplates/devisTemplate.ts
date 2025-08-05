const getDevisEmailHTML = (name: any, link: any) => {
    return `
    <div style="max-width: 600px; margin: auto; font-family: 'Helvetica Neue', sans-serif; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(90deg, #4e54c8, #8f94fb); padding: 30px 20px; text-align: center;">
        <h1 style="color: #fff; font-size: 26px; margin-bottom: 10px;">🎯 ${name}, découvrez votre couverture santé idéale</h1>
        <p style="color: #eee; font-size: 16px;">Votre devis est prêt ! Nos experts ont sélectionné pour vous les meilleures offres.</p>
      </div>
  
      <div style="padding: 25px 20px;">
        <h2 style="color: #333; font-size: 20px; margin-bottom: 20px;">💎 Offres personnalisées :</h2>
  
        ${generateOfferCard('Mutuelle Zen', '23 €/mois', '#4e54c8', `${link}/zen`, 'Voir cette offre')}
        ${generateOfferCard('Mutuelle Orange', '28 €/mois', '#ff8c00', `${link}/orange`, 'Comparer maintenant')}
        ${generateOfferCard('Mutuelle Verte', '30 €/mois', '#00b894', `${link}/verte`, 'Découvrir')}
      </div>
  
      <div style="background: #f6f6f6; padding: 20px; text-align: center; font-size: 12px; color: #777;">
        <p>Vous recevez cet email car vous avez demandé une simulation sur notre plateforme.</p>
        <p><a href="${link}/desinscription" style="color: #999;">Se désabonner</a> | <a href="${link}/confidentialite" style="color: #999;">Politique de confidentialité</a></p>
      </div>
    </div>
    `;
  };
  
  const generateOfferCard = (title: string, price: string, color: string, url: string, buttonText: string) => `
    <div style="background: #fff; border: 1px solid #eee; border-radius: 10px; padding: 20px; margin-bottom: 20px; position: relative;">
      <div style="background: ${color}; color: white; padding: 5px 10px; border-radius: 5px; display: inline-block;">${title}</div>
      <a href="${url}" style="position: absolute; top: 20px; right: 20px; background: ${color}; color: white; padding: 8px 15px; text-decoration: none; border-radius: 5px; font-weight: bold;">${buttonText}</a>
      <p style="margin-top: 50px;"><strong>${title}</strong> – ${price}</p>
    </div>
  `;
  
  module.exports = getDevisEmailHTML;
  