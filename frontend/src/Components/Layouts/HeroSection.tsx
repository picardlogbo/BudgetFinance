import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Titre */}
        <h2 className="text-3xl md:text-5xl font-extrabold mb-6 drop-shadow-lg leading-tight">
          Maîtrisez votre budget, maîtrisez votre avenir
        </h2>

        {/* Sous-titre */}
        <p className="text-base md:text-lg mb-8 drop-shadow-md opacity-90">
          Simplifiez la gestion de vos finances avec notre application intuitive et sécurisée. 
          Prenez le contrôle dès aujourd'hui !
        </p>

        {/* Bouton */}
        <Link to="/dashboard">
          <button className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-gray-100 transition duration-300">
            Commencer Maintenant
          </button>
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
