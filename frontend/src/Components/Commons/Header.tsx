import { Link } from "react-router-dom";
import { useAppContext } from "../../Utils/AppContextUtils";


const Header = () => {
     const { isLoggedIn } = useAppContext();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 shadow-md border-b border-gray-200">
      <div className="px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center w-full">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src=""
              alt="Logo TrackFlow"
              className="h-12 w-12 object-contain rounded-full"
            />
            <span className="text-xl font-bold tracking-tight text-red-700">
              Money Cash 
            </span>
          </Link>

          {/* User Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <span>
              {isLoggedIn ? (

                <div className="flex items-center space-x-4">

                  <Link to="/dashboard" className="hover:underline">
                    Mon Dashboard
                  </Link>

                  <Link to="/depenses" className="hover:underline">
                    Mes Dépenses
                  </Link>

                  <Link to="/epargne" className="hover:underline">
                    Mon Epargne
                  </Link>

                  <Link to="/budgets" className="hover:underline">
                    Mon Budget
                  </Link>

                   <Link to="/factures" className="hover:underline">
                    Mes Factures
                  </Link>

                  <Link to="/revenus" className="hover:underline">
                    Mes Revenus
                  </Link>

                </div>
              ) : (
                <Link
              to="/signup"
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-center"
            >
              S'inscrire
            </Link>
              ) }
            </span>
          </nav>

        </div>
      </div>
    </header>
  );
};

export default Header;