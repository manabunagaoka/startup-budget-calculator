'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, Users, MapPin, Building2, DollarSign, X, MessageCircle, Send, HelpCircle } from 'lucide-react';

interface Employee {
  id: number;
  role: string;
  salary: number;
}

interface ChatMessage {
  id: number;
  type: 'user' | 'bot';
  text: string;
  isTyping?: boolean;
  isStreaming?: boolean;
  displayedText?: string;
  suggestedValue?: number | null;
  category?: string | null;
}

interface EmployeeCosts {
  baseSalary: number;
  taxes: number;
  benefits: number;
  total: number;
}

interface LocationData {
  name: string;
  stateTax: number;
  localTax: number;
  unemploymentRate: number;
  workersComp: number;
}

interface EntityType {
  name: string;
  federalTax: number;
  stateFiling: number;
  annualFees: number;
  compliance: string;
}

interface RoleTemplate {
  title: string;
  low: number;
  mid: number;
  high: number;
}

interface KnowledgeBaseItem {
  text: string;
  suggestedValue: number | null;
  category: string | null;
}

// Typewriter animation component
const TypewriterText: React.FC<{ 
  text: string; 
  speed?: number; 
  onComplete?: () => void;
}> = ({ text, speed = 30, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <span className="whitespace-pre-line">
      {displayedText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
};

const StartupBudgetCalculator = () => {
  const [location, setLocation] = useState('cambridge-ma');
  const [entityType, setEntityType] = useState('llc');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState({
    rent: 8000,
    utilities: 500,
    insurance: 800,
    legal: 1500,
    accounting: 1000,
    software: 2000,
    marketing: 3000,
    miscellaneous: 1000
  });

  // Chat system state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, type: 'bot', text: 'Hi! I can help explain startup costs. Ask me about insurance, legal fees, benefits, or any other expense categories.' }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [gettingStartedExpanded, setGettingStartedExpanded] = useState(false);

  // Location data
  const locations: Record<string, LocationData> = {
    'cambridge-ma': { name: 'Cambridge, MA', stateTax: 5.0, localTax: 0, unemploymentRate: 2.9, workersComp: 0.75 },
    'nyc-ny': { name: 'New York City, NY', stateTax: 6.85, localTax: 3.876, unemploymentRate: 3.4, workersComp: 1.2 },
    'sf-ca': { name: 'San Francisco, CA', stateTax: 9.3, localTax: 0, unemploymentRate: 2.1, workersComp: 0.9 },
    'austin-tx': { name: 'Austin, TX', stateTax: 0, localTax: 0, unemploymentRate: 3.2, workersComp: 0.6 },
    'denver-co': { name: 'Denver, CO', stateTax: 4.25, localTax: 0, unemploymentRate: 3.8, workersComp: 0.8 },
    'seattle-wa': { name: 'Seattle, WA', stateTax: 0, localTax: 0, unemploymentRate: 4.1, workersComp: 1.1 }
  };

  const entityTypes: Record<string, EntityType> = {
    'sole-prop': { name: 'Sole Proprietorship', federalTax: 0, stateFiling: 100, annualFees: 50, compliance: 'Minimal' },
    'llc': { name: 'LLC', federalTax: 0, stateFiling: 500, annualFees: 300, compliance: 'Low' },
    'delaware-c': { name: 'Delaware C-Corp', federalTax: 21, stateFiling: 300, annualFees: 450, compliance: 'High' },
    'state-c-corp': { name: 'State C-Corp', federalTax: 21, stateFiling: 800, annualFees: 600, compliance: 'High' },
    's-corp': { name: 'S-Corporation', federalTax: 0, stateFiling: 800, annualFees: 500, compliance: 'Medium' },
    'b-corp': { name: 'B-Corporation', federalTax: 21, stateFiling: 500, annualFees: 650, compliance: 'High' },
    'nonprofit': { name: 'Non-Profit (501c3)', federalTax: 0, stateFiling: 400, annualFees: 200, compliance: 'High' },
    'pbc': { name: 'Public Benefit Corp', federalTax: 21, stateFiling: 600, annualFees: 700, compliance: 'High' }
  };

  const roleTemplates: Record<string, RoleTemplate> = {
    'founder-ceo': { title: 'Founder/CEO', low: 60000, mid: 120000, high: 200000 },
    'co-founder': { title: 'Co-Founder', low: 60000, mid: 110000, high: 180000 },
    'cto': { title: 'CTO/Tech Lead', low: 120000, mid: 180000, high: 280000 },
    'engineer-senior': { title: 'Senior Engineer', low: 120000, mid: 160000, high: 220000 },
    'engineer': { title: 'Software Engineer', low: 85000, mid: 130000, high: 180000 },
    'engineer-junior': { title: 'Junior Engineer', low: 65000, mid: 95000, high: 130000 },
    'designer-senior': { title: 'Senior Designer', low: 95000, mid: 130000, high: 170000 },
    'designer': { title: 'Product Designer', low: 75000, mid: 110000, high: 150000 },
    'marketing-director': { title: 'Marketing Director', low: 100000, mid: 140000, high: 190000 },
    'marketing': { title: 'Marketing Manager', low: 65000, mid: 95000, high: 130000 },
    'sales-director': { title: 'Sales Director', low: 90000, mid: 130000, high: 180000 },
    'sales': { title: 'Sales Rep', low: 50000, mid: 75000, high: 120000 },
    'operations': { title: 'Operations Manager', low: 70000, mid: 100000, high: 140000 },
    'customer-success': { title: 'Customer Success', low: 55000, mid: 80000, high: 110000 },
    'admin': { title: 'Admin/Assistant', low: 40000, mid: 55000, high: 75000 }
  };

  const getKnowledgeBaseFallback = (message: string): KnowledgeBaseItem => {
    const lowerMessage = message.toLowerCase();
    const knowledgeBase: Record<string, KnowledgeBaseItem> = {
      'insurance': {
        text: `**Business Insurance typically includes:**\n\n**General Liability:** $300-800/month\n• Covers customer injuries, property damage claims\n\n**Professional Liability:** $200-600/month\n• Covers errors, omissions, negligence claims\n\n**Cyber Liability:** $100-300/month\n• Covers data breaches, cyber attacks\n\n**Workers' Compensation:** $500-2000/month\n• Required in most states when you have employees\n\n**Total typical range:** $800-1500/month for early-stage startups`,
        suggestedValue: 1000,
        category: 'insurance'
      },
      'legal': {
        text: `**Legal costs for startups:**\n\n**Business Formation:** $500-2000 one-time\n**Monthly Legal Retainer:** $500-2000/month\n• Employment law compliance\n• Contract reviews and negotiations\n• IP protection\n\n**Cost-saving tips:**\n• Use templates for standard contracts\n• Legal insurance plans: $200-400/month`,
        suggestedValue: 1200,
        category: 'legal'
      },
      'accounting': {
        text: `**Accounting & Bookkeeping:**\n\n**Monthly Bookkeeping:** $300-800/month\n**Tax Preparation:** $150-500/month\n**CFO Services:** $2000-5000/month\n**Payroll Processing:** $50-200/month\n\n**Total typical range:** $500-1500/month`,
        suggestedValue: 800,
        category: 'accounting'
      },
      'software': {
        text: `**Essential SaaS tools:**\n\n**Development:** $100-500/month\n**Business Operations:** $200-800/month\n**Marketing Tools:** $100-500/month\n**Security:** $100-500/month\n\n**Total typical range:** $1000-4000/month`,
        suggestedValue: 2000,
        category: 'software'
      },
      'marketing': {
        text: `**Marketing budget:**\n\n**Digital Advertising:** $1000-10000/month\n**Content & Creative:** $500-2000/month\n**Tools & Software:** $200-800/month\n\n**General rule:** 7-12% of revenue for B2B\n**Early stage:** $2000-8000/month typical`,
        suggestedValue: 3000,
        category: 'marketing'
      }
    };
    
    for (const [key, data] of Object.entries(knowledgeBase)) {
      if (lowerMessage.includes(key)) {
        return data;
      }
    }
    
    return {
      text: `I can help explain costs for: insurance, legal, accounting, software, or marketing. What would you like to know more about?`,
      suggestedValue: null,
      category: null
    };
  };

  const getChatResponse = async (message: string) => {
    try {
      const context = {
        location: locations[location].name,
        entityType: entityTypes[entityType].name,
        teamSize: employees.length,
        monthlyBudget: Math.round(totalMonthlyCosts)
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context }),
      });

      if (!response.ok) throw new Error('API request failed');
      return await response.json();
    } catch (error) {
      console.error('Chat API error:', error);
      return getKnowledgeBaseFallback(message);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    const userMessage: ChatMessage = { id: Date.now(), type: 'user', text: currentMessage };
    setChatMessages(prev => [...prev, userMessage]);
    
    const typingMessage: ChatMessage = { id: Date.now() + 1, type: 'bot', text: 'Thinking...', isTyping: true };
    setChatMessages(prev => [...prev, typingMessage]);
    setCurrentMessage('');

    try {
      const response = await getChatResponse(currentMessage);
      
      // Create a streaming message that will be animated
      const streamingMessage: ChatMessage = {
        id: Date.now() + 2,
        type: 'bot',
        text: response.text,
        isStreaming: true,
        suggestedValue: response.suggestedValue,
        category: response.category
      };
      
      setChatMessages(prev => prev.filter(msg => !msg.isTyping).concat([streamingMessage]));
    } catch (error) {
      setChatMessages(prev => prev.filter(msg => !msg.isTyping).concat([{
        id: Date.now() + 2,
        type: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        suggestedValue: null,
        category: null
      }]));
    }
  };

  const handleTypingComplete = (messageId: number) => {
    setChatMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isStreaming: false }
          : msg
      )
    );
  };

  const applySuggestedValue = (category: string, value: number) => {
    if (category && value) {
      setMonthlyExpenses(prev => ({ ...prev, [category]: value }));
    }
  };

  const calculateEmployeeCost = (salary: number): EmployeeCosts => {
    const locationData = locations[location];
    const socialSecurity = salary * 0.062;
    const medicare = salary * 0.0145;
    const futa = Math.min(salary, 7000) * 0.006;
    const suta = salary * (locationData.unemploymentRate / 100);
    const workersComp = salary * (locationData.workersComp / 100);
    const healthInsurance = 7200;
    const retirement401k = salary * 0.03;
    const ptoValue = salary * 0.08;
    const totalTaxes = socialSecurity + medicare + futa + suta + workersComp;
    const totalBenefits = healthInsurance + retirement401k + ptoValue;
    
    return {
      baseSalary: salary,
      taxes: totalTaxes,
      benefits: totalBenefits,
      total: salary + totalTaxes + totalBenefits
    };
  };

  const addEmployee = (roleKey: string) => {
    const role = roleTemplates[roleKey];
    setEmployees([...employees, { id: Date.now(), role: role.title, salary: role.mid }]);
  };

  const updateEmployee = (id: number, field: keyof Employee, value: string | number) => {
    setEmployees(employees.map(emp => emp.id === id ? { ...emp, [field]: value } : emp));
  };

  const removeEmployee = (id: number) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const totalEmployeeCosts = employees.reduce((total, emp) => {
    const costs = calculateEmployeeCost(emp.salary);
    return total + costs.total;
  }, 0);

  const totalMonthlyOperating = Object.values(monthlyExpenses).reduce((a, b) => a + b, 0);
  const totalMonthlyCosts = (totalEmployeeCosts / 12) + totalMonthlyOperating;
  const annualCosts = totalMonthlyCosts * 12;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Calculator className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-normal text-gray-900">Startup Budget Calculator</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="max-w-4xl">
            <h2 className="text-xl font-medium text-gray-900 mb-2">Plan Your Startup Budget</h2>
            <p className="text-gray-600 mb-4">
              Build a comprehensive budget by selecting your location, business type, team, and expenses. 
              We&apos;ll calculate taxes, benefits, and compliance costs automatically.
            </p>
            
            <button
              onClick={() => setGettingStartedExpanded(!gettingStartedExpanded)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              {gettingStartedExpanded ? 'Hide' : 'See'} example budgets
              <span className={`transform transition-transform duration-200 ${gettingStartedExpanded ? 'rotate-180' : 'rotate-0'}`}>
                ▼
              </span>
            </button>
            
            {gettingStartedExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => {
                      setEmployees([]);
                      addEmployee('founder-ceo');
                      addEmployee('engineer');
                      setMonthlyExpenses(prev => ({...prev, rent: 3000, software: 800, marketing: 1000, insurance: 500}));
                      setGettingStartedExpanded(false);
                    }}
                    className="p-4 text-left border border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
                  >
                    <div className="font-medium text-gray-900 mb-1">Bootstrap Startup</div>
                    <div className="text-sm text-gray-600 mb-2">2 people • Minimal office • Remote-friendly</div>
                    <div className="text-xs text-blue-600 font-medium">~$18k/month total</div>
                  </button>
                  
                  <button 
                    onClick={() => {
                      setEmployees([]);
                      addEmployee('founder-ceo');
                      addEmployee('cto');
                      addEmployee('engineer');
                      addEmployee('engineer');
                      addEmployee('designer');
                      setMonthlyExpenses(prev => ({...prev, rent: 8000, software: 2000, marketing: 4000, insurance: 1000}));
                      setGettingStartedExpanded(false);
                    }}
                    className="p-4 text-left border border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
                  >
                    <div className="font-medium text-gray-900 mb-1">Product Team</div>
                    <div className="text-sm text-gray-600 mb-2">5 people • Professional office • Full benefits</div>
                    <div className="text-xs text-blue-600 font-medium">~$55k/month total</div>
                  </button>
                  
                  <button 
                    onClick={() => {
                      setEmployees([]);
                      ['founder-ceo', 'cto', 'engineer', 'engineer', 'engineer', 'designer', 'marketing', 'sales', 'operations'].forEach(role => addEmployee(role));
                      setMonthlyExpenses(prev => ({...prev, rent: 15000, software: 4000, marketing: 8000, insurance: 1500}));
                      setGettingStartedExpanded(false);
                    }}
                    className="p-4 text-left border border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
                  >
                    <div className="font-medium text-gray-900 mb-1">Growth Stage</div>
                    <div className="text-sm text-gray-600 mb-2">9 people • Full operations • Enterprise ready</div>
                    <div className="text-xs text-blue-600 font-medium">~$95k/month total</div>
                  </button>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Quick Start:</strong> Choose a template above to see a complete budget example, then customize the salaries, location, and expenses for your specific situation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <MapPin className="w-4 h-4" />
                  Business Location
                </label>
                <select 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(locations).map(([key, loc]) => (
                    <option key={key} value={key}>{loc.name}</option>
                  ))}
                </select>
                <div className="mt-2 text-xs text-gray-500">
                  State Income Tax: {locations[location].stateTax}%
                  {locations[location].localTax > 0 && ` + Local: ${locations[location].localTax}%`}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Building2 className="w-4 h-4" />
                  Business Entity
                </label>
                <select 
                  value={entityType} 
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(entityTypes).map(([key, entity]) => (
                    <option key={key} value={key}>{entity.name}</option>
                  ))}
                </select>
                <div className="mt-2 text-xs text-gray-500">
                  Federal Tax: {entityTypes[entityType].federalTax}% | Compliance: {entityTypes[entityType].compliance}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                  <Users className="w-5 h-5" />
                  Team Planning
                </h2>
                <div className="relative">
                  <select 
                    onChange={(e) => e.target.value && addEmployee(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                    value=""
                  >
                    <option value="">+ Add Role</option>
                    {Object.entries(roleTemplates).map(([key, role]) => (
                      <option key={key} value={key}>{role.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {employees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Add your first team member to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {employees.map((emp) => {
                    const costs = calculateEmployeeCost(emp.salary);
                    const roleData = Object.values(roleTemplates).find(r => r.title === emp.role);
                    return (
                      <div key={emp.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{emp.role}</h4>
                          <button 
                            onClick={() => removeEmployee(emp.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Annual Salary</label>
                            <input 
                              type="number" 
                              value={emp.salary}
                              onChange={(e) => updateEmployee(emp.id, 'salary', parseInt(e.target.value) || 0)}
                              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter salary"
                            />
                            {roleData && (
                              <div className="text-xs text-gray-500 mt-1">
                                Market range: ${roleData.low.toLocaleString()} - ${roleData.high.toLocaleString()}
                              </div>
                            )}
                          </div>
                          <div className="bg-white rounded-md p-3 border border-gray-100">
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Base Salary:</span>
                                <span className="font-medium">${costs.baseSalary.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">+ Taxes:</span>
                                <span>${costs.taxes.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">+ Benefits:</span>
                                <span>${costs.benefits.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between border-t border-gray-200 pt-1 font-medium text-gray-900">
                                <span>Total Cost:</span>
                                <span>${costs.total.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="flex items-center gap-2 text-lg font-medium text-gray-900 mb-5">
                <DollarSign className="w-5 h-5" />
                Monthly Operating Expenses
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Office Rent</label>
                    <input 
                      type="number" 
                      value={monthlyExpenses.rent}
                      onChange={(e) => setMonthlyExpenses({...monthlyExpenses, rent: parseInt(e.target.value) || 0})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter monthly rent"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      Insurance
                      <button 
                        onClick={() => {
                          setChatOpen(true);
                          const response = getKnowledgeBaseFallback('insurance');
                          setChatMessages(prev => [...prev, {
                            id: Date.now(),
                            type: 'bot',
                            text: response.text,
                            isStreaming: true,
                            suggestedValue: response.suggestedValue,
                            category: response.category
                          }]);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </label>
                    <input 
                      type="number" 
                      value={monthlyExpenses.insurance}
                      onChange={(e) => setMonthlyExpenses({...monthlyExpenses, insurance: parseInt(e.target.value) || 0})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="text-xs text-gray-500 mt-1">General liability, professional, cyber</div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      Legal & Professional
                      <button 
                        onClick={() => {
                          setChatOpen(true);
                          const response = getKnowledgeBaseFallback('legal');
                          setChatMessages(prev => [...prev, {
                            id: Date.now(),
                            type: 'bot',
                            text: response.text,
                            isStreaming: true,
                            suggestedValue: response.suggestedValue,
                            category: response.category
                          }]);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </label>
                    <input 
                      type="number" 
                      value={monthlyExpenses.legal}
                      onChange={(e) => setMonthlyExpenses({...monthlyExpenses, legal: parseInt(e.target.value) || 0})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="text-xs text-gray-500 mt-1">Legal counsel, business licenses</div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      Accounting & Bookkeeping
                      <button 
                        onClick={() => {
                          setChatOpen(true);
                          const response = getKnowledgeBaseFallback('accounting');
                          setChatMessages(prev => [...prev, {
                            id: Date.now(),
                            type: 'bot',
                            text: response.text,
                            isStreaming: true,
                            suggestedValue: response.suggestedValue,
                            category: response.category
                          }]);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </label>
                    <input 
                      type="number" 
                      value={monthlyExpenses.accounting}
                      onChange={(e) => setMonthlyExpenses({...monthlyExpenses, accounting: parseInt(e.target.value) || 0})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="text-xs text-gray-500 mt-1">Bookkeeping, tax prep, payroll</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      Software & Tools
                      <button 
                        onClick={() => {
                          setChatOpen(true);
                          const response = getKnowledgeBaseFallback('software');
                          setChatMessages(prev => [...prev, {
                            id: Date.now(),
                            type: 'bot',
                            text: response.text,
                            isStreaming: true,
                            suggestedValue: response.suggestedValue,
                            category: response.category
                          }]);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </label>
                    <input 
                      type="number" 
                      value={monthlyExpenses.software}
                      onChange={(e) => setMonthlyExpenses({...monthlyExpenses, software: parseInt(e.target.value) || 0})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="text-xs text-gray-500 mt-1">SaaS subscriptions, development tools</div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      Marketing & Sales
                      <button 
                        onClick={() => {
                          setChatOpen(true);
                          const response = getKnowledgeBaseFallback('marketing');
                          setChatMessages(prev => [...prev, {
                            id: Date.now(),
                            type: 'bot',
                            text: response.text,
                            isStreaming: true,
                            suggestedValue: response.suggestedValue,
                            category: response.category
                          }]);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </label>
                    <input 
                      type="number" 
                      value={monthlyExpenses.marketing}
                      onChange={(e) => setMonthlyExpenses({...monthlyExpenses, marketing: parseInt(e.target.value) || 0})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="text-xs text-gray-500 mt-1">Advertising, content, events</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Utilities</label>
                    <input 
                      type="number" 
                      value={monthlyExpenses.utilities}
                      onChange={(e) => setMonthlyExpenses({...monthlyExpenses, utilities: parseInt(e.target.value) || 0})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="text-xs text-gray-500 mt-1">Electric, internet, phone, water</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Other Expenses</label>
                    <input 
                      type="number" 
                      value={monthlyExpenses.miscellaneous}
                      onChange={(e) => setMonthlyExpenses({...monthlyExpenses, miscellaneous: parseInt(e.target.value) || 0})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="text-xs text-gray-500 mt-1">Equipment, supplies, travel, meals</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Summary</h3>
              
              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Team Costs (Annual)</span>
                    <span className="font-medium text-gray-900">${totalEmployeeCosts.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="pb-3 border-b border-gray-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Operating (Monthly)</span>
                    <span className="font-medium text-gray-900">${totalMonthlyOperating.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="pb-3 border-b border-gray-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Operating (Annual)</span>
                    <span className="font-medium text-gray-900">${(totalMonthlyOperating * 12).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900">Total Annual</span>
                    <span className="text-2xl font-bold text-gray-900">${annualCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                    <span>Monthly Average</span>
                    <span>${Math.round(totalMonthlyCosts).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
              <h4 className="font-medium text-gray-900 mb-3">Key Metrics</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Team Size:</span>
                  <span className="font-medium">{employees.length} employees</span>
                </div>
                {employees.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. loaded cost:</span>
                    <span className="font-medium">${Math.round(totalEmployeeCosts / employees.length).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Entity Type:</span>
                  <span className="font-medium">{entityTypes[entityType].name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax Rate:</span>
                  <span className="font-medium">{(locations[location].stateTax + (locations[location].localTax || 0)).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="font-medium text-gray-900 mb-3">Funding Requirements</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">12-month runway:</span>
                  <span className="font-medium">${Math.round(annualCosts).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">18-month runway:</span>
                  <span className="font-medium">${Math.round(annualCosts * 1.5).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">24-month runway:</span>
                  <span className="font-medium">${Math.round(annualCosts * 2).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {chatOpen && (
          <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="bg-white border-b border-gray-200 px-4 py-3 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Cost Assistant</span>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <div className="text-sm">
                      {message.type === 'bot' && message.isStreaming ? (
                        <TypewriterText 
                          text={message.text} 
                          speed={25}
                          onComplete={() => handleTypingComplete(message.id)}
                        />
                      ) : (
                        <span className="whitespace-pre-line">{message.text}</span>
                      )}
                    </div>
                    {message.suggestedValue && message.category && !message.isStreaming && (
                      <button
                        onClick={() => applySuggestedValue(message.category!, message.suggestedValue!)}
                        className="mt-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      >
                        Apply ${message.suggestedValue}/month
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask about any business expense..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={sendMessage}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40 flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Help</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default StartupBudgetCalculator;
