import React from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    <div className="flex flex-col items-center gap-6 p-4 bg-slate-50">
      {/* Action Buttons - Hidden on Print */}
      <div className="print:hidden flex gap-3">
        <Button 
          onClick={handlePrint} 
          className="flex gap-2 shadow-lg hover:shadow-xl transition-all bg-blue-600 hover:bg-blue-700"
        >
          <Printer className="w-4 h-4" /> Print Official Document
        </Button>
        <Button 
          variant="outline"
          className="flex gap-2 shadow-md"
        >
          <Download className="w-4 h-4" /> Export PDF
        </Button>
      </div>

      {/* Main Document Container - Professional A4 Format */}
      <div className="w-[210mm] min-h-[297mm] bg-white text-black p-[25mm] shadow-2xl print:shadow-none print:p-[20mm] border border-slate-300 print:border-none">
        
        {/* Official Header with Republic Seal Styling */}
        <div className="text-center mb-10 border-b-4 border-double border-slate-800 pb-6">
          <div className="space-y-0.5 mb-4">
            <p className="text-[9pt] font-semibold tracking-[0.3em] uppercase text-slate-700">
              Republic of the Philippines
            </p>
            <h1 className="text-[16pt] font-black tracking-tight uppercase text-slate-900 mt-2">
              Bohol Island State University
            </h1>
            <p className="text-[12pt] font-semibold text-slate-800">Candijay Campus</p>
            <p className="text-[10pt] italic text-slate-600">Cogtong, Candijay, Bohol</p>
            <p className="text-[9pt] text-slate-500 mt-1">Tel: (038) 000-0000 • Email: candijay@bisu.edu.ph</p>
          </div>
          
          {/* Document Title Section */}
          <div className="mt-8 pt-6 border-t-2 border-slate-300">
            <div className="bg-slate-900 text-white py-4 px-6 -mx-6">
              <h2 className="text-[24pt] font-black tracking-wide">BUDGET PLAN</h2>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-[13pt] font-bold uppercase tracking-wide">Calendar Year 2024</p>
              <p className="text-[12pt] font-semibold text-slate-700">College of Sciences</p>
            </div>
          </div>
        </div>

        {/* Document Reference Number */}
        <div className="text-right mb-6 text-[9pt] text-slate-600 print:mb-4">
          <p>Document No.: BISU-CC-BUD-2024-001</p>
          <p>Date Issued: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>

        {/* Budget Summary Box */}
        <div className="bg-slate-50 border-2 border-slate-300 p-4 mb-6 rounded-sm">
          <div className="flex justify-between items-center">
            <span className="text-[11pt] font-bold uppercase tracking-wide">Total Allocated Budget:</span>
            <span className="text-[16pt] font-black text-slate-900">
              ₱{totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Estimated Expenditures Table */}
        <div className="border-2 border-slate-900 mb-8">
          <Table className="text-[10pt]">
            <TableHeader>
              <TableRow className="bg-slate-900 hover:bg-slate-900 border-none">
                <TableHead className="text-white font-bold uppercase h-14 border-r-2 border-white text-[11pt]">
                  Estimated Expenditures
                </TableHead>
                <TableHead className="text-white font-bold text-right h-14 w-48 text-[11pt]">
                  Amount (PHP)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat, idx) => (
                <React.Fragment key={cat.id}>
                  {/* Category Header */}
                  <TableRow className="bg-slate-100 hover:bg-slate-100 border-b-2 border-slate-900">
                    <TableCell className="font-bold py-4 text-[11pt] border-r-2 border-slate-300">
                      <span className="inline-block w-8 font-black">{String.fromCharCode(65 + idx)}.</span>
                      <span className="uppercase">{cat.name}</span>
                      <span className="text-slate-600 font-normal ml-2">({cat.allocation_percentage}%)</span>
                    </TableCell>
                    <TableCell className="text-right font-black py-4 text-[11pt] bg-slate-50">
                      ₱{parseFloat(cat.allocated_budget || 0).toLocaleString(undefined, { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      })}
                    </TableCell>
                  </TableRow>
                  
                  {/* Subcategory Rows */}
                  {cat.subcategories.map((sub, sIdx) => (
                    <TableRow 
                      key={sub.id} 
                      className="hover:bg-slate-50 border-b border-slate-200 transition-colors"
                    >
                      <TableCell className="py-3 border-r-2 border-slate-200">
                        <span className="inline-block w-8 ml-6 text-slate-600 font-semibold">
                          {sIdx + 1}.
                        </span>
                        <span className="text-slate-800">{sub.name}</span>
                      </TableCell>
                      <TableCell className="text-right py-3 tabular-nums font-medium text-slate-700">
                        {parseFloat(sub.allocation_amount || 0).toLocaleString(undefined, { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2 
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
              
              {/* Grand Total Row */}
              <TableRow className="bg-slate-900 hover:bg-slate-900 border-t-4 border-slate-900">
                <TableCell className="font-black uppercase py-4 text-white text-[11pt]">
                  Grand Total
                </TableCell>
                <TableCell className="text-right font-black py-4 text-white text-[12pt]">
                  ₱{totalBudget.toLocaleString(undefined, { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Certification Statement */}
        <div className="mb-10 p-4 bg-slate-50 border-l-4 border-slate-700 text-[10pt] leading-relaxed">
          <p className="font-semibold mb-2">CERTIFICATION:</p>
          <p className="text-justify text-slate-700">
            This is to certify that the budget allocation presented herein has been carefully reviewed 
            and is in accordance with the approved financial plan for the Calendar Year 2024. 
            All expenditures shall be subject to existing government auditing rules and regulations.
          </p>
        </div>

        {/* Signature Section - Professional Layout */}
        <div className="mt-16">
          <div className="grid grid-cols-2 gap-16">
            {/* Prepared By */}
            <div>
              <p className="text-[10pt] text-slate-600 mb-12">Prepared by:</p>
              <div className="border-b-2 border-slate-900 pb-1 mb-2">
                <p className="text-[12pt] font-bold uppercase text-center">MARLINA S. UY</p>
              </div>
              <p className="text-[9pt] uppercase text-slate-600 text-center tracking-wide">
                Budget Designate
              </p>
              <p className="text-[8pt] text-slate-500 text-center mt-1">
                Date: ___________________
              </p>
            </div>

            {/* Approved By */}
            <div>
              <p className="text-[10pt] text-slate-600 mb-12">Approved by:</p>
              <div className="border-b-2 border-slate-900 pb-1 mb-2">
                <p className="text-[12pt] font-bold uppercase text-center">LUZMINDA H.D.</p>
              </div>
              <p className="text-[9pt] uppercase text-slate-600 text-center tracking-wide">
                Dean, College of Sciences
              </p>
              <p className="text-[8pt] text-slate-500 text-center mt-1">
                Date: ___________________
              </p>
            </div>
          </div>

          {/* Additional Approval (if needed) */}
          <div className="mt-12 text-center border-t-2 border-slate-200 pt-8">
            <p className="text-[10pt] text-slate-600 mb-12">Noted by:</p>
            <div className="inline-block">
              <div className="border-b-2 border-slate-900 pb-1 mb-2 min-w-[300px]">
                <p className="text-[12pt] font-bold uppercase text-center">
                  [CAMPUS DIRECTOR NAME]
                </p>
              </div>
              <p className="text-[9pt] uppercase text-slate-600 text-center tracking-wide">
                Campus Director
              </p>
              <p className="text-[8pt] text-slate-500 text-center mt-1">
                Date: ___________________
              </p>
            </div>
          </div>
        </div>

        {/* Footer - Document Control */}
        <div className="mt-16 pt-6 border-t border-slate-300 text-[8pt] text-slate-500">
          <div className="flex justify-between items-center">
            <div>
              <p>BISU Candijay Campus • Official Budget Document</p>
              <p className="text-[7pt] mt-0.5">
                This document is official and confidential. Unauthorized reproduction is prohibited.
              </p>
            </div>
            <div className="text-right">
              <p>Page 1 of 1</p>
              <p className="text-[7pt] mt-0.5 print:hidden">
                Generated: {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default BudgetPrintDocument;