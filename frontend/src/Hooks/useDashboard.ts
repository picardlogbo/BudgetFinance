import { useGetBudget } from "./useBudjet";
import { useGetDepenses } from "./useDepense";
import { useGetEpargne } from "./useEpargne";
import { useGetRevenus } from "./useRevenu";



  export const useDashboard = () => {
    const revenuDashboard = useGetRevenus();
    const depenseDashboard = useGetDepenses();
    const epargneDashboard = useGetEpargne();
    const budgetDashboard = useGetBudget();
    return {
      revenuDashboard,
      depenseDashboard,
      epargneDashboard,
      budgetDashboard
    }
}