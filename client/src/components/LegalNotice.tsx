import React from "react";

const LegalNotice: React.FC = () => {
  return (
    <section className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Mentions légales</h1>

      <article className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Éditeur du site</h2>
        <p>
          Le site <strong>MutuelleComparateur.fr</strong> est édité par la société <strong>Compar’Assur SARL</strong>,  
          au capital de 50 000 €, dont le siège social est situé au 123 rue de la Santé, 75000 Paris, France.
        </p>
        <p>
          RCS Paris : 123 456 789 - SIRET : 123 456 789 00012 - TVA Intracommunautaire : FR12 345678912
        </p>
      </article>

      <article className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Directeur de la publication</h2>
        <p>Monsieur Jean Dupont, Directeur Général</p>
      </article>

      <article className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Hébergeur</h2>
        <p>
          Le site est hébergé par <strong>OVH SAS</strong>,  
          2 rue Kellermann, 59100 Roubaix, France.
        </p>
        <p>Téléphone : +33 9 72 10 10 07</p>
      </article>

      <article className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Propriété intellectuelle</h2>
        <p>
          Tous les contenus présents sur ce site (textes, images, logos, vidéos, icônes, sons, logiciels, bases de données) sont la propriété exclusive de Compar’Assur SARL ou de ses partenaires. Toute reproduction, distribution, modification ou utilisation non autorisée est strictement interdite.
        </p>
      </article>

      <article className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Données personnelles</h2>
        <p>
          Les données personnelles collectées via ce site sont utilisées uniquement dans le cadre de nos services et conformément à notre politique de confidentialité. Vous disposez d’un droit d’accès, de modification et de suppression de vos données. Pour toute demande, contactez-nous à <a href="mailto:contact@mutuellecomparateur.fr" className="text-blue-600 underline">contact@mutuellecomparateur.fr</a>.
        </p>
      </article>

      <article className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Responsabilité</h2>
        <p>
          Compar’Assur SARL met tout en œuvre pour assurer l’exactitude des informations diffusées sur ce site. Toutefois, nous ne pouvons garantir l’absence d’erreurs ou d’omissions. L’utilisateur est responsable de l’usage des informations fournies.
        </p>
      </article>

      <article>
        <h2 className="text-xl font-semibold mb-2">Contact</h2>
        <p>
          Pour toute question relative aux mentions légales, veuillez nous contacter à <a href="mailto:contact@mutuellecomparateur.fr" className="text-blue-600 underline">contact@mutuellecomparateur.fr</a> ou par téléphone au +33 1 23 45 67 89.
        </p>
      </article>
    </section>
  );
};

export default LegalNotice;
