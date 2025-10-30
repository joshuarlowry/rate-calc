import React, { useState, useMemo } from 'react';

/**
 * A reusable component for a styled number input.
 * Handles currency and percentage symbols.
 */
function NumberInput({ label, value, onChange, unit = 'dollar', helperText = '' }) {
  const isPercent = unit === 'percent';
  const isHours = unit === 'hours';
  const isDollar = unit === 'dollar';

  const handleChange = (e) => {
    const val = e.target.value;
    // Allow empty string to clear input, or a valid number
    if (val === '' || !isNaN(parseFloat(val))) {
      onChange(val === '' ? '' : parseFloat(val));
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative mt-1 rounded-md shadow-sm">
        {isDollar && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
        )}
        <input
          type="number"
          value={value}
          onChange={handleChange}
          className={`block w-full rounded-md border-gray-300 ${isDollar ? 'pl-7' : 'pl-3'} ${isPercent || isHours ? 'pr-12' : 'pr-3'} py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
          placeholder="0"
        />
        {(isPercent || isHours) && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-500 sm:text-sm">{isPercent ? '%' : 'hrs'}</span>
          </div>
        )}
      </div>
      {helperText && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

/**
 * A reusable component for a styled select/dropdown input.
 */
function SelectInput({ label, value, onChange, options, helperText = '' }) {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={handleChange}
        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}


/**
 * A reusable component for displaying a summary item.
 */
function SummaryItem({ label, value, isCurrency = true, isNegative = false, isPositive = false, isBold = false }) {
  const formattedValue = isCurrency ? formatCurrency(value) : value;
  let valueClass = "text-gray-900";
  if (isNegative) valueClass = "text-red-600";
  if (isPositive) valueClass = "text-green-600";
  if (isBold) valueClass += " font-bold";

  return (
    <div className="flex justify-between py-2">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className={`text-sm ${valueClass}`}>{formattedValue}</span>
    </div>
  );
}

/**
 * Helper function to format numbers as currency.
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// --- Health Insurance Options ---
// Data provided by user
const healthInsuranceOptions = [
  { label: 'Single (Employee-Only)', value: 7000, details: '($8.5k-$9k Total)' },
  { label: 'Employee + Spouse', value: 13000, details: '($17k-$18k Total)' },
  { label: 'Family (Employee + Dependents)', value: 18000, details: '($23k-$25k Total)' },
  { label: 'Other (Manual Entry)', value: 'other', details: '' },
];


/**
 * Main Application Component
 */
export default function App() {
  // --- STATE FOR ALL INPUTS ---
  // Set with reasonable defaults
  const [salary, setSalary] = useState(100000);
  const [vacationBonus, setVacationBonus] = useState(2000);
  
  const [k401Contribution, setK401Contribution] = useState(10);
  // Use the 'Single' plan as the default
  const [healthInsurancePlan, setHealthInsurancePlan] = useState(healthInsuranceOptions[0].value);
  // Separate state for manual entry
  const [healthInsuranceManual, setHealthInsuranceManual] = useState(8000);
  
  const [employerTaxes, setEmployerTaxes] = useState(8.5);
  
  const [ptoHours, setPtoHours] = useState(240);
  const [trainingHours, setTrainingHours] = useState(40);
  const [holidayHours, setHolidayHours] = useState(0);
  const [overheadTime, setOverheadTime] = useState(10);
  
  const [companyOverhead, setCompanyOverhead] = useState(10);
  const [profitMargin, setProfitMargin] = useState(15); // This state variable now represents the "Reserve Fund" contribution per hour

  const totalStandardHours = 2080; // 40 hours/week * 52 weeks

  // Determine the effective health insurance cost
  const healthInsurance = useMemo(() => {
    if (healthInsurancePlan === 'other') {
      return Number(healthInsuranceManual) || 0;
    }
    return Number(healthInsurancePlan) || 0;
  }, [healthInsurancePlan, healthInsuranceManual]);


  // --- CALCULATIONS (memoized for performance) ---

  // 1. Calculate Total Annual Costs
  const totalCostData = useMemo(() => {
    const s = Number(salary) || 0;
    const vb = Number(vacationBonus) || 0;
    const hi = Number(healthInsurance) || 0;
    
    const k401Cost = s * (Number(k401Contribution) / 100 || 0);
    const taxCost = s * (Number(employerTaxes) / 100 || 0);
    const overheadCost = s * (Number(companyOverhead) / 100 || 0);
    
    const total = s + vb + hi + k401Cost + taxCost + overheadCost;
    
    return {
      salary: s,
      vacationBonus: vb,
      healthInsurance: hi,
      k401Cost,
      taxCost,
      overheadCost,
      total,
    };
  }, [salary, vacationBonus, healthInsurance, k401Contribution, employerTaxes, companyOverhead]);

  // 2. Calculate Total Billable Hours
  const totalBillableHours = useMemo(() => {
    const pto = Number(ptoHours) || 0;
    const training = Number(trainingHours) || 0;
    const holidays = Number(holidayHours) || 0;
    
    const overheadHrs = totalStandardHours * (Number(overheadTime) / 100 || 0);
    
    const totalNonBillable = pto + training + holidays + overheadHrs;
    const billable = totalStandardHours - totalNonBillable;
    
    return billable > 0 ? billable : 0;
  }, [ptoHours, trainingHours, holidayHours, overheadTime]);

  // 3. Calculate Rates
  const rates = useMemo(() => {
    if (totalBillableHours === 0) {
      return { breakEven: 0, target: 0 };
    }
    
    const breakEven = totalCostData.total / totalBillableHours;
    const pm = Number(profitMargin) || 0; // This is the reserve fund $ per hour
    
    // Target rate is the break-even cost + the reserve fund contribution
    const targetRate = breakEven + pm;
    
    return {
      breakEven,
      target: targetRate,
    };
  }, [totalCostData, totalBillableHours, profitMargin]);

  // 4. Calculate Final Summary
  const summary = useMemo(() => {
    const revenue = rates.target * totalBillableHours;
    // 'profit' here is the total reserve fund collected
    const profit = revenue - totalCostData.total; 
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    return {
      revenue,
      profit, // This is the total annual reserve contribution
      margin, // This is the reserve % of revenue
    };
  }, [rates, totalBillableHours, totalCostData]);

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Hourly Rate & Profit Calculator
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* --- INPUTS COLUMN --- */}
          <div className="flex flex-col gap-6">
            
            <InputCard title="Employee Compensation">
              <NumberInput
                label="Expected Annual Salary"
                value={salary}
                onChange={setSalary}
                unit="dollar"
              />
              <NumberInput
                label="Annual Vacation Bonus"
                value={vacationBonus}
                onChange={setVacationBonus}
                unit="dollar"
              />
            </InputCard>
            
            <InputCard title="Benefits & Taxes (Annual Cost)">
              <NumberInput
                label="Employer 401k Contribution"
                value={k401Contribution}
                onChange={setK401Contribution}
                unit="percent"
                helperText="As a % of salary"
              />
              <SelectInput
                label="Employer Health Insurance"
                value={healthInsurancePlan}
                onChange={setHealthInsurancePlan}
                options={healthInsuranceOptions.map(opt => ({
                  label: `${opt.label} ${opt.details ? `(Avg: ${formatCurrency(opt.value)})` : ''}`,
                  value: opt.value,
                }))}
                helperText="Select a plan to use the average employer cost."
              />
              {healthInsurancePlan === 'other' && (
                <NumberInput
                  label="Manual Health Insurance Cost"
                  value={healthInsuranceManual}
                  onChange={setHealthInsuranceManual}
                  unit="dollar"
                  helperText="Enter the annual employer cost."
                />
              )}
              <NumberInput
                label="Employer Taxes (FICA, SUI, etc.)"
                value={employerTaxes}
                onChange={setEmployerTaxes}
                unit="percent"
                helperText="As a % of salary"
              />
            </InputCard>
            
            <InputCard title="Non-Billable Time (Annual)">
              <NumberInput
                label="Paid Time Off (PTO) Hours"
                value={ptoHours}
                onChange={setPtoHours}
                unit="hours"
              />
              <NumberInput
                label="Training Hours"
                value={trainingHours}
                onChange={setTrainingHours}
                unit="hours"
              />
              <NumberInput
                label="Holiday Hours"
                value={holidayHours}
                onChange={setHolidayHours}
                unit="hours"
              />
              <NumberInput
                label="Non-Billable Overhead Time"
                value={overheadTime}
                onChange={setOverheadTime}
                unit="percent"
                helperText={`As a % of ${totalStandardHours} total hours (e.g., admin, meetings)`}
              />
            </InputCard>
            
            <InputCard title="Business Costs & Reserve Fund">
              <NumberInput
                label="Company Overhead"
                value={companyOverhead}
                onChange={setCompanyOverhead}
                unit="percent"
                helperText="As a % of salary (e.g., rent, software, utilities)"
              />
              <NumberInput
                label="Partner Investment / Reserve Fund"
                value={profitMargin}
                onChange={setProfitMargin}
                unit="dollar"
                helperText="Target contribution per hour for reserves (rainy day, hiring, etc.)"
              />
            </InputCard>
          </div>
          
          {/* --- OUTPUTS COLUMN --- */}
          <div className="flex flex-col gap-6">
            
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <label className="block text-lg font-medium text-gray-700">
                Recommended Hourly Rate
              </label>
              <span className="text-5xl font-bold text-blue-600">
                {formatCurrency(rates.target)}
              </span>
              <p className="text-sm text-gray-500 mt-2">
                Break-Even Rate (Costs Only): {formatCurrency(rates.breakEven)} / hour
              </p>
            </div>
            
            <OutputCard title="Annual Projections">
              {totalBillableHours <= 0 && (
                <p className="text-red-600 font-bold text-center p-4">
                  Warning: Non-billable hours exceed total available hours. Billable hours are zero.
                </p>
              )}
              <SummaryItem
                label="Total Billable Hours"
                value={totalBillableHours.toFixed(0)}
                isCurrency={false}
              />
              <SummaryItem
                label="Total Annual Revenue"
                value={summary.revenue}
                isPositive
              />
              <SummaryItem
                label="Total Annual Costs"
                value={totalCostData.total}
                isNegative
              />
              <hr className="my-2" />
              <SummaryItem
                label="Total Annual Reserve Contribution"
                value={summary.profit}
                isPositive
                isBold
              />
              <SummaryItem
                label="Reserve % of Revenue"
                value={`${summary.margin.toFixed(2)}%`}
                isCurrency={false}
                isBold
              />
            </OutputCard>
            
            <OutputCard title="Annual 'Balancing' Breakdown">
              <SummaryItem
                label="Total Annual Revenue"
                value={summary.revenue}
                isPositive
                isBold
              />
              <div className="pl-4 border-l-2 border-gray-200 mt-2">
                <SummaryItem
                  label="Less: Base Salary"
                  value={totalCostData.salary}
                  isNegative
                />
                <SummaryItem
                  label="Less: 401k Contribution"
                  value={totalCostData.k401Cost}
                  isNegative
                />
                <SummaryItem
                  label="Less: Vacation Bonus"
                  value={totalCostData.vacationBonus}
                  isNegative
                />
                <SummaryItem
                  label="Less: Health Insurance"
                  value={totalCostData.healthInsurance}
                  isNegative
                />
                <SummaryItem
                  label="Less: Employer Taxes"
                  value={totalCostData.taxCost}
                  isNegative
                />
                <SummaryItem
                  label="Less: Company Overhead"
                  value={totalCostData.overheadCost}
                  isNegative
                />
              </div>
              <hr className="my-2" />
              <SummaryItem
                label="= Total Annual Costs"
                value={totalCostData.total}
                isNegative
                isBold
              />
              <SummaryItem
                label="= Total Annual Reserve Contribution"
                labelClass="font-bold"
                value={summary.profit}
                isPositive
                isBold
              />
            </OutputCard>
            
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * A reusable card wrapper for input sections.
 */
function InputCard({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

/**
 * A reusable card wrapper for output sections.
 */
function OutputCard({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-4">
        {title}
      </h2>
      <div className="flex flex-col gap-1">
        {children}
      </div>
    </div>
  );
}


