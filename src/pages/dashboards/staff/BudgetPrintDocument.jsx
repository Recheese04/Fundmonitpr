import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

const BudgetPrintDocument = ({ categories }) => {
  const handlePrint = () => {
    window.print();
  };

  // Calculate total budget
  const totalBudget = categories.reduce((sum, cat) => 
    sum + parseFloat(cat.allocated_budget || 0), 0
  );

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body * {
            visibility: hidden;
          }
          
          #printable-budget, #printable-budget * {
            visibility: visible;
          }
          
          #printable-budget {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-slate-100 py-8">
        {/* Action Buttons */}
        <div className="no-print max-w-5xl mx-auto mb-6 flex gap-3 px-4">
          <Button 
            onClick={handlePrint} 
            className="flex gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="w-4 h-4" /> Print Budget
          </Button>
          <Button 
            variant="outline"
            className="flex gap-2"
          >
            <Download className="w-4 h-4" /> Export PDF
          </Button>
        </div>

        {/* Printable Document */}
        <div id="printable-budget" className="max-w-5xl mx-auto bg-white shadow-lg print:shadow-none p-12 print:p-0">
          
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-slate-800">
            <p className="text-xs tracking-widest uppercase text-slate-600 mb-1">
              Republic of the Philippines
            </p>
            <h1 className="text-2xl font-bold uppercase mb-1">
              Bohol Island State University
            </h1>
            <p className="text-base font-semibold mb-0.5">Candijay Campus</p>
            <p className="text-sm italic text-slate-600">Cogtong, Candijay, Bohol</p>
            
            <div className="mt-6 pt-4 border-t border-slate-300">
              <h2 className="text-3xl font-black uppercase mb-2">Budget Plan</h2>
              <p className="text-lg font-bold">Calendar Year 2024</p>
              <p className="text-base font-semibold text-slate-700">College of Sciences</p>
            </div>
          </div>

          {/* Budget Summary */}
          <div className="mb-6 bg-slate-800 text-white p-4 flex justify-between items-center">
            <span className="text-sm font-bold uppercase">Total Budget Allocation:</span>
            <span className="text-2xl font-black">
              ₱{totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Main Budget Table */}
          <table className="w-full border-2 border-slate-900 mb-8">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="text-left py-3 px-4 font-bold uppercase text-sm border-r-2 border-white">
                  Budget Category / Item
                </th>
                <th className="text-left py-3 px-4 font-bold uppercase text-sm w-64">
                  Description
                </th>
                <th className="text-right py-3 px-4 font-bold uppercase text-sm w-40">
                  Amount (₱)
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => (
                <React.Fragment key={cat.id}>
                  {/* Category Header Row */}
                  <tr className="bg-slate-200 border-t-2 border-slate-900">
                    <td colSpan="3" className="py-3 px-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-base uppercase">
                          {String.fromCharCode(65 + idx)}. {cat.name}
                        </span>
                        <span className="font-black text-lg">
                          ₱{parseFloat(cat.allocated_budget || 0).toLocaleString(undefined, { 
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2 
                          })}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        Allocation: {cat.allocation_percentage}% of total budget
                      </div>
                    </td>
                  </tr>
                  
                  {/* Subcategory Rows */}
                  {cat.subcategories && cat.subcategories.length > 0 ? (
                    cat.subcategories.map((sub, sIdx) => (
                      <tr key={sub.id} className="border-b border-slate-300 hover:bg-slate-50">
                        <td className="py-2.5 px-4 pl-8 border-r border-slate-300">
                          <span className="font-medium">{sIdx + 1}. {sub.name}</span>
                        </td>
                        <td className="py-2.5 px-4 text-sm text-slate-600 border-r border-slate-300">
                          {sub.description || '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold tabular-nums">
                          {parseFloat(sub.allocation_amount || 0).toLocaleString(undefined, { 
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2 
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b border-slate-300">
                      <td colSpan="3" className="py-2 px-4 pl-8 text-sm italic text-slate-500">
                        No subcategories defined
                      </td>
                    </tr>
                  )}
                  
                  {/* Category Subtotal */}
                  <tr className="bg-slate-100 border-b-2 border-slate-400">
                    <td colSpan="2" className="py-2 px-4 font-bold text-sm uppercase text-right">
                      Subtotal - {cat.name}:
                    </td>
                    <td className="py-2 px-4 text-right font-bold">
                      ₱{parseFloat(cat.allocated_budget || 0).toLocaleString(undefined, { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      })}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
              
              {/* Grand Total */}
              <tr className="bg-slate-900 text-white border-t-4 border-slate-900">
                <td colSpan="2" className="py-4 px-4 font-black uppercase text-right text-base">
                  Grand Total:
                </td>
                <td className="py-4 px-4 text-right font-black text-xl">
                  ₱{totalBudget.toLocaleString(undefined, { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Certification */}
          <div className="mb-8 p-4 bg-slate-50 border-l-4 border-slate-700">
            <p className="font-bold text-sm mb-2">CERTIFICATION:</p>
            <p className="text-xs text-justify leading-relaxed text-slate-700">
              This is to certify that the budget allocation presented herein has been carefully reviewed 
              and is in accordance with the approved financial plan for the Calendar Year 2024. 
              All expenditures shall be subject to existing government auditing rules and regulations.
            </p>
          </div>

          {/* Signature Section */}
          <div className="mt-12 grid grid-cols-2 gap-16">
            {/* Prepared By */}
            <div>
              <p className="text-xs text-slate-600 mb-16">Prepared by:</p>
              <div className="text-center">
                <div className="border-b-2 border-slate-900 pb-1 mb-1">
                  <p className="font-bold uppercase text-sm">MARLINA S. UY</p>
                </div>
                <p className="text-xs uppercase text-slate-600 tracking-wide">Budget Designate</p>
                <p className="text-xs text-slate-500 mt-2">Date: _______________</p>
              </div>
            </div>

            {/* Approved By */}
            <div>
              <p className="text-xs text-slate-600 mb-16">Approved by:</p>
              <div className="text-center">
                <div className="border-b-2 border-slate-900 pb-1 mb-1">
                  <p className="font-bold uppercase text-sm">LUZMINDA H.D.</p>
                </div>
                <p className="text-xs uppercase text-slate-600 tracking-wide">Dean, College of Sciences</p>
                <p className="text-xs text-slate-500 mt-2">Date: _______________</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-4 border-t border-slate-300 text-xs text-slate-500 flex justify-between">
            <div>
              <p>BISU Candijay Campus - Official Budget Document</p>
              <p className="text-[10px] mt-0.5">This document is official and confidential.</p>
            </div>
            <div className="text-right">
              <p>Page 1 of 1</p>
              <p className="text-[10px] mt-0.5">Doc. No.: BISU-CC-BUD-2024-001</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BudgetPrintDocument;