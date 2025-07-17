import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CSSTransition } from 'react-transition-group'; // React Transition Group
import {
  fetchTables,
  selectAllTables,
  selectTableStatus,
} from '../features/tables/tableSlice';
import {
  startCustomerSession,
  selectCustomerStatus,
  selectCustomerError,
  setTableInfo,
} from '../features/customer/customerSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Armchair, User, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

export default function CustomerLandingPage({ navigateTo }) {
  const dispatch = useDispatch();
  const tables = useSelector(selectAllTables);
  const tableStatus = useSelector(selectTableStatus);
  const customerStatus = useSelector(selectCustomerStatus);
  const customerError = useSelector(selectCustomerError);

  const [name, setName] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  const [inView, setInView] = useState(false);
  const rootRef = useRef(null);

  // Fetch tables on first mount
  useEffect(() => {
    if (tableStatus === 'idle') dispatch(fetchTables());
  }, [tableStatus, dispatch]);

  // Show error
  useEffect(() => {
    if (customerStatus === 'failed' && customerError) {
      toast({
        title: 'Sesi Gagal Dimulai',
        description: customerError,
        variant: 'destructive',
      });
    }
  }, [customerStatus, customerError]);

  // Scroll-triggered animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (rootRef.current) observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  const handleTableSelect = (table) => {
    if (table.isAvailable) {
      setSelectedTable(table);
      dispatch(setTableInfo({ tableId: table._id, tableName: table.tableNumber }));
    }
  };

  const handleStartOrder = () => {
    if (!name || !selectedTable) {
      toast({
        title: 'Whoops! Something\'s missing.',
        description: 'Please enter your name and select a table.',
        variant: 'destructive',
      });
      return;
    }

    dispatch(startCustomerSession({ customerName: name, tableId: selectedTable._id }))
      .unwrap()
      .then((result) => {
        toast({
          title: `Welcome, ${result.sessionData.customerName}!`,
          description: `You're at table ${selectedTable.tableNumber}.`,
        });
        navigateTo('menu');
      })
      .catch(console.error);
  };

  return (
    <main
      ref={rootRef}
      className="min-h-screen flex flex-col justify-center items-center p-6 text-white"
      style={{ perspective: '1000px' }}
    >
      <CSSTransition in={inView} timeout={400} classNames="fade" appear>
        <div className="w-full max-w-4xl space-y-12">
          {/* Heading */}
          <section className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Welcome to Café Horizon
            </h1>
            <p className="text-lg text-gray-400 mt-4 max-w-xl mx-auto">
              Your premium coffee experience starts here.
            </p>
          </section>

          {/* Form Card */}
          <section
            className="bg-zinc-900/50 backdrop-blur-md rounded-3xl border border-white/10 shadow-lg p-8 md:p-12 transition-transform hover:shadow-amber-500/10"
            style={{
              transformStyle: 'preserve-3d',
              willChange: 'transform',
              animation: inView ? 'fadeInUp 0.5s ease-out forwards' : 'none',
            }}
          >
            {/* Name Input */}
            <div className="mb-8">
              <label htmlFor="customer-name" className="block text-base mb-2 text-gray-200">
                What should we call you?
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="customer-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  aria-label="Customer name"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
            </div>

            {/* Tables Grid */}
            <div className="mb-10">
              <h3 className="text-base font-semibold text-gray-200 mb-3">Choose your table</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {tableStatus === 'loading' && (
                  <p className="text-gray-500">Loading tables...</p>
                )}
                {tables.map((table) => (
                  <button
                    key={table._id}
                    onClick={() => handleTableSelect(table)}
                    disabled={!table.isAvailable}
                    aria-label={`Table ${table.tableNumber}`}
                    className={`transition-all duration-300 rounded-xl p-4 flex flex-col justify-center items-center text-sm aspect-square touch-manipulation ${selectedTable?._id === table._id
                      ? 'bg-amber-500 text-white shadow-md'
                      : table.isAvailable
                        ? 'bg-white/10 hover:bg-amber-500/10 border border-white/20 text-white'
                        : 'bg-red-900/40 text-gray-500 cursor-not-allowed'
                      }`}
                    style={{
                      minWidth: '48px',
                      minHeight: '48px',
                      willChange: 'transform',
                      transform: 'translateZ(0)',
                    }}
                  >
                    <Armchair className="w-6 h-6 mb-1" />
                    <span className="font-semibold">{table.tableNumber}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleStartOrder}
              disabled={!name || !selectedTable || customerStatus === 'loading'}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 text-lg rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              aria-label="Start Order"
            >
              {customerStatus === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Validating...
                </>
              ) : (
                <>
                  Start My Order <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </section>
        </div>
      </CSSTransition>
    </main>
  );
}
