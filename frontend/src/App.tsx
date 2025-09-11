
import { Route, Routes } from 'react-router'
// import Dashboard from './Pages/Dashboard';
import Home from './Pages/Home';
import Register from './Pages/Register';
import Header from './Components/Commons/Header';
import Login from './Pages/Login';
import RevenuManager from './Pages/RevenuManager';
import ExpenseManager from './Pages/depenseManager';
import FactureManager from './Pages/FactureManager';
import BudgetPage from './Pages/BudgetPage';
import EpargneManager from './Pages/EpargneManager';
import { Dashboard } from './Pages/Dashboard';
import AnalyseFacture from './Pages/AnalyseFacture';
import { AnalyseDepense } from './Components/Depenses/AnalyseDepense';

function App() {

  return (
    <>
    <Header />
     <Routes>
       <Route path="/" element={<Home />} />
       <Route path="/dashboard" element={<Dashboard />} />
       <Route path="/signup" element={<Register />} />
       <Route path="/login" element={<Login />} />
       <Route path="/revenus" element={<RevenuManager />} />
       <Route path="/depenses" element={<ExpenseManager />} />
  <Route path="/factures" element={<FactureManager />} />
  <Route path="/analyse-factures" element={<AnalyseFacture />} />
       <Route path="/budgets" element={<BudgetPage />} />
       <Route path="/epargne" element={<EpargneManager />} />
       <Route path="/analyse-depenses" element={<AnalyseDepense />} />
        {/* <Route path="*" element={<NotFound />} /> */}
     </Routes>
    </>
  )
}

export default App;
