import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  CreditCard, Sparkles, CheckCircle2, Shield, 
  ArrowRight, Download, Receipt, Loader2, Lock, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Billing: React.FC = () => {
  const { workspace, addToast, updateWorkspace } = useApp();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<'PRO' | 'ENTERPRISE' | null>(null);

  // Card input states
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardZip, setCardZip] = useState('');

  const handleUpgradeClick = (plan: 'PRO' | 'ENTERPRISE') => {
    if (!workspace) return;
    if (workspace.activePlan === plan) {
      addToast('You are already on this plan.', 'info');
      return;
    }
    setCheckoutPlan(plan);
    setIsCheckoutOpen(true);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutPlan || !workspace) return;

    if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim() || !cardZip.trim()) {
      addToast('Please complete all payment fields.', 'warning');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate Stripe PaymentIntent processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const updatedWorkspace = await api.upgradePlan(workspace.id, checkoutPlan);
      updateWorkspace(updatedWorkspace);
      
      addToast(`Payment processed! Successfully upgraded to ${checkoutPlan} plan.`, 'success');
      setIsCheckoutOpen(false);
      
      // Clear inputs
      setCardName('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
      setCardZip('');
    } catch (e: any) {
      addToast(e.message || 'Transaction failed. Please check card details.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!workspace) return null;

  const planPrices = {
    PRO: 49,
    ENTERPRISE: 199
  };

  const activePrice = checkoutPlan ? planPrices[checkoutPlan] : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-[60px] pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 dark:text-brand-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
              <CreditCard className="w-3 h-3" /> Subscription & Billing
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Manage Your Plan</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Current Active Workspace Plan: <strong className="text-slate-800 dark:text-slate-200">{workspace.activePlan}</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoices Left Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-xl">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-500" /> Recent Invoices
            </h3>
            
            <div className="space-y-2">
              <div 
                onClick={() => addToast('Invoice download started.', 'success')}
                className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-slate-400 group-hover:text-brand-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">INV-2026-05</p>
                    <p className="text-[9px] text-slate-400">May 1, 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">$49.00</span>
                  <Download className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              
              <div 
                onClick={() => addToast('Invoice download started.', 'success')}
                className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-slate-400 group-hover:text-brand-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">INV-2026-04</p>
                    <p className="text-[9px] text-slate-400">Apr 1, 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">$49.00</span>
                  <Download className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pro Plan */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-6 rounded-2xl shadow-xl relative overflow-hidden flex flex-col">
            {workspace.activePlan === 'PRO' && (
              <div className="absolute top-0 right-0 bg-brand-500 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg z-10">
                Current Plan
              </div>
            )}
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-500" />
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Pro Founder</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-black text-slate-900 dark:text-white">$49</span>
              <span className="text-xs text-slate-500 font-semibold">/ month</span>
            </div>
            
            <p className="text-xs text-slate-500 mb-6">Perfect for early-stage founders ready to validate and build their startup.</p>
            
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                <span>Unlimited AI workspace documents generation</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                <span>Unlimited pitch decks & business plans</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                <span>Advanced AI Mentor Context (RAG)</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                <span>Export to PDF, Markdown & PowerPoint</span>
              </li>
            </ul>
            
            <button
              onClick={() => handleUpgradeClick('PRO')}
              disabled={workspace.activePlan === 'PRO'}
              className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                workspace.activePlan === 'PRO' 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25'
              }`}
            >
              {workspace.activePlan === 'PRO' ? 'Current Plan' : <>Upgrade to Pro <ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden flex flex-col">
            {workspace.activePlan === 'ENTERPRISE' && (
              <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg z-10">
                Current Plan
              </div>
            )}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
            
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-white">Startup Studio</h3>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-black text-white">$199</span>
              <span className="text-xs text-slate-400 font-semibold">/ month</span>
            </div>
            
            <p className="text-xs text-slate-400 mb-6">For venture studios and agencies building multiple startups in parallel.</p>
            
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Enterprise AI studio access</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Unlimited workspaces & team members</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>White-labeled exports</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Priority model access & custom support</span>
              </li>
            </ul>
            
            <button
              onClick={() => handleUpgradeClick('ENTERPRISE')}
              disabled={workspace.activePlan === 'ENTERPRISE'}
              className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                workspace.activePlan === 'ENTERPRISE' 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25'
              }`}
            >
              {workspace.activePlan === 'ENTERPRISE' ? 'Current Plan' : <>Upgrade to Studio <ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
          </div>
        </div>
      </div>
      
      {/* Checkout Gateway Modal */}
      <AnimatePresence>
        {isCheckoutOpen && checkoutPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <Lock className="w-4.5 h-4.5 text-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Secure Payment Checkout</h3>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProcessPayment}>
                <div className="p-6 space-y-6">
                  {/* Order summary */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-850 space-y-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Order Summary</span>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-350">
                      <span>{checkoutPlan === 'PRO' ? 'Pro Founder Subscription' : 'Startup Studio Subscription'} (1 Month)</span>
                      <span>${activePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-350">
                      <span>Estimated Tax (0%)</span>
                      <span>$0.00</span>
                    </div>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
                    <div className="flex justify-between text-sm font-bold text-slate-800 dark:text-white">
                      <span>Total Due</span>
                      <span className="text-emerald-500">${activePrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Card Info Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cardholder Name</label>
                      <input 
                        type="text"
                        required
                        placeholder="Piyush Sakha"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Credit Card Number</label>
                      <div className="relative">
                        <input 
                          type="text"
                          required
                          maxLength={19}
                          placeholder="4242 4242 4242 4242"
                          value={cardNumber}
                          onChange={(e) => {
                            // Simple format spacing card numbers
                            const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                            setCardNumber(val);
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 pl-10 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 font-mono"
                        />
                        <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expiration</label>
                        <input 
                          type="text"
                          required
                          maxLength={5}
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\//g, '');
                            if (val.length > 2) {
                              val = val.substring(0, 2) + '/' + val.substring(2);
                            }
                            setCardExpiry(val);
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 font-mono text-center"
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">CVC</label>
                        <input 
                          type="text"
                          required
                          maxLength={4}
                          placeholder="123"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 font-mono text-center"
                        />
                      </div>

                      <div className="col-span-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">ZIP / Postal</label>
                        <input 
                          type="text"
                          required
                          placeholder="90210"
                          value={cardZip}
                          onChange={(e) => setCardZip(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 font-medium text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" /> Secure SSL Connection
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                      {isProcessing ? 'Processing...' : `Pay & Activate`}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <Shield className="w-3.5 h-3.5 text-emerald-500" /> Secure payments processed securely by Stripe integration
      </div>
    </div>
  );
};
