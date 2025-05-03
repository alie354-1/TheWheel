import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { financialHubService } from '../../../lib/services/financialHub.service';
import { Landmark, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'; // Using relevant icons

// Interface for snapshot data (adjust based on actual service response)
interface FinancialSnapshot {
  burnRate?: number;
  runwayMonths?: number; // Keep for future use
  cashOnHand?: number; // Keep for future use
  // recentSpending?: { category: string; amount: number }[]; // Removed for now
}

interface FinancialSnapshotWidgetProps {
  companyId: string;
}

// Helper to format currency
const formatCurrency = (amount?: number): string => {
  if (amount === undefined || amount === null) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

const FinancialSnapshotWidget: React.FC<FinancialSnapshotWidgetProps> = ({ companyId }) => {
  const [snapshot, setSnapshot] = useState<FinancialSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSnapshot = async () => {
      if (!companyId) return;
      setLoading(true);
      setError(null);
      try {
        // Use the new getFinancialSnapshot method which calls the DB function
        const data = await financialHubService.getFinancialSnapshot(companyId);
        setSnapshot(data);
      } catch (err: any) {
        console.error("Error fetching financial snapshot for widget:", err);
        setError(err.message || "Failed to load financial data");
        setSnapshot(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshot();
  }, [companyId]);

  // Placeholder for runway alert - cannot calculate without cash on hand
  const runwayAlert = false; // Keep placeholder logic

  return (
    // Use shadow-lg for consistency, add h-full for grid alignment if needed
    <div className="card bg-base-100 shadow-lg h-full">
       {/* Adjusted padding */}
      <div className="card-body p-5">
        <h3 className="card-title text-lg font-semibold mb-3"> {/* Increased size/margin */}
          <Landmark className="w-5 h-5 mr-1 text-primary" /> {/* Added color */}
          Financial Snapshot
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-6"> {/* Increased padding */}
            <span className="loading loading-spinner loading-md"></span> {/* Larger spinner */}
          </div>
        ) : error ? (
           <div className="alert alert-error text-sm p-3"> {/* Use alert for error */}
             <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <span>{error}</span>
          </div>
        ) : snapshot ? (
          <div className="flex flex-col justify-between flex-grow"> {/* Use flex to push button down */}
            <div className="space-y-3"> {/* Increased spacing */}
               {/* Display Monthly Burn Rate from DB function */}
              <div className="flex justify-between items-baseline"> {/* Use baseline align */}
                <span className="text-sm text-gray-600">Monthly Burn Rate:</span>
                <span className="text-lg font-semibold text-error">{formatCurrency(snapshot.burnRate)}</span> {/* Larger font, error color for emphasis */}
              </div>

               {/* Placeholders for unavailable data */}
               <div className="flex justify-between items-baseline text-sm text-gray-400">
                 <span>Cash on Hand:</span>
                 <span className="font-medium italic">N/A</span>
               </div>
               <div className={`flex justify-between items-baseline text-sm text-gray-400 ${runwayAlert ? 'text-error font-bold' : ''}`}>
                 <span>Est. Runway:</span>
                 <span className="font-medium italic flex items-center">
                   N/A
                   {/* {runwayAlert && <AlertTriangle className="w-4 h-4 ml-1" />} */}
                 </span>
               </div>
            </div>

            <div className="card-actions justify-end mt-4"> {/* Increased margin */}
              {/* TODO: Link to the main Finance tab */}
              <button className="btn btn-sm btn-primary btn-outline" onClick={() => alert('Navigate to Finance Tab (TODO)')}>
                View Full Budget
              </button>
            </div>
          </div>
        ) : (
           <p className="text-sm text-gray-500">No financial data available.</p>
        )}
      </div>
    </div>
  );
};

export default FinancialSnapshotWidget;
