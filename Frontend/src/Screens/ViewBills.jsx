import "./Bill.css";
import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function ViewBills() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [bills, setBillsList] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [displayedBills, setDisplayedBills] = useState([]);
  const [dateFilteredBills, setDateFilteredBills] = useState([]); // bills filtered by date/range
  const [searchType, setSearchType] = useState(""); // "id", "date", "month", or ""
  const [selectedMonth, setSelectedMonth] = useState("");
  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD from date input
  const [endDate, setEndDate] = useState(""); // YYYY-MM-DD from date input
  const [billStatus, setBillStatus] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(""); // For dropdown selection
  const billRef = useRef();
  const [statusFilter, setStatusFilter] = useState('All');
  // Edit functionality removed — view-only page

  // Apply status filter to a date-filtered list and set displayedBills
  const applyStatusFilter = (list, status = statusFilter) => {
    if (!list || list.length === 0) {
      setDisplayedBills([]);
      return;
    }
    if (!status || status === 'All') {
      setDisplayedBills(list);
    } else {
      const filtered = list.filter(b => (b.status || 'Pending') === status);
      setDisplayedBills(filtered);
    }
  };

   useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await axios.get("/bill/show");
        if (response.data.success) {
          setBillsList(response.data.data);
        } else {
          console.error('Error fetching bills:', response.data.message);
          alert('Error fetching bills: ' + response.data.message);
        }
      } catch (error) {
        console.error('Error fetching bills:', error);
        alert('Error fetching bills: ' + (error.response?.data?.message || error.message));
      }
    };
    fetchBills();
    // view-only: no product list fetch required here
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length === 0) {
      setSuggestions([]);
      setDisplayedBills([]);
      setSelectedBill(null);
      setProducts([]);
      setSelectedStatus("");
      setSearchType("");
      // Clear date-based state and reset status filter so no 'no results' message remains
      setDateFilteredBills([]);
      setStatusFilter('All');
      return;
    }

    // Check if search is by ID or date
    const isDateSearch = isQueryDate(value);
    
    if (isDateSearch) {
      // Search by date - show multiple bills
      // Handle both DD/MM/YYYY and DD/MM/YY formats
      const dateParts = value.split('/');
      const day = dateParts[0].padStart(2, '0');
      const month = dateParts[1].padStart(2, '0');
      const year = dateParts[2];
      
      // Create search patterns for both 2-digit and 4-digit years
      const searchPattern2Digit = `${day}/${month}/${year.length === 4 ? year.slice(-2) : year}`;
      const searchPattern4Digit = `${day}/${month}/${year.length === 2 ? '20' + year : year}`;
      
      console.log('Date search:', { value, searchPattern2Digit, searchPattern4Digit, billsCount: bills.length });
      console.log('Sample bill dates:', bills.slice(0, 3).map(bill => bill.Date));
      
      const filtered = bills.filter((item) => {
        // Check both 2-digit and 4-digit year formats
        const matches2Digit = item.Date.includes(searchPattern2Digit);
        const matches4Digit = item.Date.includes(searchPattern4Digit);
        const matches = matches2Digit || matches4Digit;
        console.log(`Checking ${item.Date} against ${searchPattern2Digit} or ${searchPattern4Digit}: ${matches}`);
        return matches;
      });
      
  console.log('Filtered bills:', filtered.length);
  setDateFilteredBills(filtered);
  applyStatusFilter(filtered, statusFilter);
      setSuggestions([]);
      setSelectedBill(null);
      setProducts([]);
      setSearchType("date");
    } else {
      // Search by ID - show single bill
      const filtered = bills.filter(
        (item) => (item.order_id || '').toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setDisplayedBills([]);
      
      // If exact ID match found, auto-select the bill
      if (filtered.length === 1 && (filtered[0].order_id || '').toLowerCase() === value.toLowerCase()) {
        handleSuggestionClick(filtered[0]);
        setSearchType("id");
      } else {
        setSelectedBill(null);
        setProducts([]);
        setSearchType("id");
      }
    }
  };

  const handleSuggestionClick = (bill) => {
    const val = JSON.stringify(bill);
    localStorage.setItem("billDetails", val);
    setSelectedBill(bill);
    setProducts(bill.products);
  setQuery(bill.order_id);
    setSelectedStatus(bill.status || 'Pending'); // Set selected status for dropdown
    setSuggestions([]);
    setDisplayedBills([]);
  };

  // Edit handlers removed for view-only page

  // Add/remove/edit/product search removed — view-only

  // Save helper removed — view-only page

  const showAllBills = () => {
    // If user has searched for a date, show bills for that date
    if (query && isQueryDate(query)) {
      // Handle both DD/MM/YYYY and DD/MM/YY formats
      const dateParts = query.split('/');
      const day = dateParts[0].padStart(2, '0');
      const month = dateParts[1].padStart(2, '0');
      const year = dateParts[2];
      
      // Create search patterns for both 2-digit and 4-digit years
      const searchPattern2Digit = `${day}/${month}/${year.length === 4 ? year.slice(-2) : year}`;
      const searchPattern4Digit = `${day}/${month}/${year.length === 2 ? '20' + year : year}`;
      
      // Filter bills for the searched date
      const searchedBills = bills.filter(bill => {
        return bill.Date.includes(searchPattern2Digit) || bill.Date.includes(searchPattern4Digit);
      });
      setDateFilteredBills(searchedBills);
      applyStatusFilter(searchedBills, statusFilter);
      setSearchType("date");
    }
    // } else {
    //   // If no date is searched, show all bills
    //   setDisplayedBills(bills);
    //   setSearchType("all");
    // }
    
    setSuggestions([]);
    setSelectedBill(null);
    setProducts([]);
  };

  const downloadPDF = async () => {
    if (!billRef.current || !selectedBill) return;
    let prevDisplay = [];

    try {
      // Add class to hide/remove elements and apply print-like styles
      const table = billRef.current.querySelector('table');
      if (table) table.classList.add('pdf-generating');
      // Temporarily apply print-like styling and set A4 width for accurate capture
      const originalWidth = billRef.current.style.width || '';
      billRef.current.classList.add('invoice-print');
      document.body.classList.add('printing');
      billRef.current.style.width = '210mm';

      // Hide status container(s) while capturing PDF
      const statusElems = billRef.current.querySelectorAll('.bill-status-container');
      const prevDisplay = [];
      statusElems.forEach((el, i) => {
        prevDisplay[i] = el.style.display;
        el.style.display = 'none';
      });

      const canvas = await html2canvas(billRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Save as JPEG image instead of PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = imgData;
  link.download = `${selectedBill.order_id || 'bill'}.jpeg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      // cleanup
      try {
        const table = billRef.current?.querySelector('table');
        if (table) table.classList.remove('pdf-generating');
        billRef.current?.classList.remove('invoice-print');
        document.body.classList.remove('printing');
        // restore width if we changed it
        if (billRef.current && billRef.current.style.width === '210mm') billRef.current.style.width = '';
        // restore status container display
        const statusElemsRestore = billRef.current?.querySelectorAll('.bill-status-container') || [];
        statusElemsRestore.forEach((el, i) => {
          el.style.display = prevDisplay[i] || '';
        });
      } catch (e) {
        // ignore cleanup errors
      }
    }
  };

  const printInvoice = () => {
    window.print();
  };

  // Helper function to get next status in cycle
  const getNextStatus = (currentStatus) => {
    const status = currentStatus || 'Pending';
    switch (status) {
      case 'Pending':
        return 'Cash';
      case 'Cash':
        return 'Online';
      case 'Online':
        return 'Pending';
      default:
        return 'Pending';
    }
  };

  const updateBillStatus = async (billId, newStatus) => {
    try {
      const response = await axios.put(`/bill/update/${billId}`, {
        status: newStatus
      });
      
      if (response.data.success) {
        // Show success alert with backend response
        alert(`✅ ${response.data.message}`);
        
        // Update the local state
        setBillsList(prevBills => 
          prevBills.map(bill => 
            bill._id === billId ? { ...bill, status: newStatus } : bill
          )
        );
        
        // Update selectedBill if it's the one being updated
        if (selectedBill && selectedBill._id === billId) {
          setSelectedBill(prev => ({ ...prev, status: newStatus }));
          setSelectedStatus(newStatus); // Update the dropdown selection
        }
        
        // Update displayedBills if it contains the updated bill
        setDisplayedBills(prevBills => 
          prevBills.map(bill => 
            bill._id === billId ? { ...bill, status: newStatus } : bill
          )
        );
        
        // Update suggestions if it contains the updated bill
        setSuggestions(prevSuggestions => 
          prevSuggestions.map(bill => 
            bill._id === billId ? { ...bill, status: newStatus } : bill
          )
        );
      } else {
        alert(`❌ ${response.data.message}`);
      }
      
    } catch (error) {
      console.error('Error updating bill status:', error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`❌ Error updating bill status: ${errorMessage}\nPlease try again.`);
    }
  };

  // Delete a bill after user confirmation
  const deleteBill = async (billId) => {
    if (!billId) return;
    const confirmDelete = window.confirm('Are you sure you want to delete this bill?');
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`/bill/delete/${billId}`);
      if (response.data && response.data.success) {
        alert('✅ Bill deleted successfully');
        // Remove from local lists
        setBillsList(prev => prev.filter(b => b._id !== billId));
        setDisplayedBills(prev => prev.filter(b => b._id !== billId));
        setSuggestions(prev => prev.filter(b => b._id !== billId));
        // If the deleted bill was selected, clear selection
        if (selectedBill && selectedBill._id === billId) {
          setSelectedBill(null);
          setProducts([]);
          setQuery('');
        }
      } else {
        alert('❌ Failed to delete bill: ' + (response.data?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting bill:', error);
      alert('❌ Error deleting bill: ' + (error.response?.data?.message || error.message));
    }
  };

  // useEffect(() => {
  //   const clearAfterPrint = () => setProducts([]);
  //   window.addEventListener("afterprint", clearAfterPrint);
  //   return () => window.removeEventListener("afterprint", clearAfterPrint);
  // }, []);

  // View-only aggregates (use the stored products)
  const currentProducts = products;
  const subtotal = currentProducts.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 0), 0);
  const deliveryCharge = Number(selectedBill?.deliveryCharge || 0);
  const total = subtotal + deliveryCharge;

  // Profit calculations based on per-unit profit field on each product
  const profitMap = {};
  const productsForProfit = products;
  productsForProfit.forEach(p => {
    const qty = Number(p.quantity) || 0;
    const perUnitProfit = Number(p.profit) || 0;
    const lineProfit = perUnitProfit * qty;
    const cat = (p.category || 'other').toLowerCase();
    profitMap[cat] = (profitMap[cat] || 0) + lineProfit;
  });
  const profitByCategory = Object.keys(profitMap).map(cat => ({ category: cat, amount: Math.round(profitMap[cat] * 100) / 100 }));
  const totalProfit = Object.values(profitMap).reduce((a,b) => a + b, 0);

  const isQueryDate = (q) => {
  // Check for DD/MM/YYYY format
  const ddmmyyyy = /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(q);
  // Check for DD/MM/YY format
  const ddmmyy = /^\d{1,2}\/\d{1,2}\/\d{2}$/.test(q);
  return ddmmyyyy || ddmmyy;
};


  // Get available months from bills
  const getAvailableMonths = () => {
    const months = new Set();
    bills.forEach(bill => {
      // Parse DD/MM/YYYY format correctly
      const dateParts = bill.Date.split('/');
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10);
        const year = parseInt(dateParts[2], 10);
        
        const billDate = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
        const yearMonth = `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, '0')}`;
        months.add(yearMonth);
      }
    });
    return Array.from(months).sort().reverse();
  };

  // Calculate current month turnover
  const getCurrentMonthTurnover = () => {
    const currentDate = new Date();
    const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    const currentMonthBills = bills.filter(bill => {
      // Parse DD/MM/YYYY format correctly
      const dateParts = bill.Date.split('/');
      if (dateParts.length !== 3) return false;
      
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10);
      const year = parseInt(dateParts[2], 10);
      
      const billDate = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
      const billYearMonth = `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, '0')}`;
      return billYearMonth === currentYearMonth;
    });
    
    return currentMonthBills.reduce((total, bill) => {
      const billTotal =
        bill.products.reduce((sum, p) => sum + p.price * p.quantity, 0) +
        (bill.deliveryCharge || 0);
      return total + billTotal;
    }, 0);
  };

  // Calculate turnover for selected month
  const getSelectedMonthTurnover = () => {
    if (!selectedMonth) return getCurrentMonthTurnover();
    return getMonthlyTurnover(selectedMonth);
  };

  // Calculate turnover for displayed bills
  const totalTurnover = displayedBills.reduce((total, bill) => {
    const billTotal =
      bill.products.reduce((sum, p) => sum + p.price * p.quantity, 0) +
      (bill.deliveryCharge || 0);
    return total + billTotal;
  }, 0);

  // Calculate monthly turnover for specific month
  const getMonthlyTurnover = (yearMonth) => {
    const monthlyBills = bills.filter(bill => {
      // Parse DD/MM/YYYY format correctly
      const dateParts = bill.Date.split('/');
      if (dateParts.length !== 3) return false;
      
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10);
      const year = parseInt(dateParts[2], 10);
      
      const billDate = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
      const billYearMonth = `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, '0')}`;
      return billYearMonth === yearMonth;
    });
    
    return monthlyBills.reduce((total, bill) => {
      const billTotal =
        bill.products.reduce((sum, p) => sum + p.price * p.quantity, 0) +
        (bill.deliveryCharge || 0);
      return total + billTotal;
    }, 0);
  };

  return (
    <>
      <Navbar />
    <div className="container mt-4">
      {/* Monthly Turnover Display */}
      <div className="container mt-4" style={{ maxWidth: "600px" }}>
        <div className="alert alert-success" style={{ 
          borderRadius: '12px', 
          border: '1px solid #9ae6b4', 
          background: 'linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <strong style={{ color: '#22543d', fontSize: '1.1rem' }}>
                📊 Monthly Turnover
              </strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ 
                color: '#22543d', 
                fontSize: '1.5rem', 
                fontWeight: '700',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}>
                (&#8377;){getSelectedMonthTurnover().toFixed(2)}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ color: '#2f855a', fontSize: '0.9rem', fontWeight: '500', margin: 0 }}>
              Select Month:
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #9ae6b4',
                background: 'white',
                color: '#22543d',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                minWidth: '150px'
              }}
            >
              <option value="">Current Month</option>
              {getAvailableMonths().map((month) => {
                const [year, monthNum] = month.split('-');
                const monthName = new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                return (
                  <option key={month} value={month}>
                    {monthName}
                  </option>
                );
              })}
            </select>
            {/* Placeholder for date range - moved below month select for layout */}
          </div>
        </div>
      </div>

      {/* Date range inputs (centered below the monthly box) */}
      <div className="container mt-3" style={{ maxWidth: '600px', display: 'flex', justifyContent: 'center' }}>
        <div className="alert alert-success" style={{
          borderRadius: '12px',
          border: '1px solid #9ae6b4',
          background: 'linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ color: '#2f855a', fontSize: '0.9rem', margin: 0 }}>From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #9ae6b4' }}
            />
            <label style={{ color: '#2f855a', fontSize: '0.9rem', margin: 0 }}>To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #9ae6b4' }}
            />
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => {
                // Validate dates
                if (!startDate || !endDate) {
                  alert('Please select both From and To dates');
                  return;
                }
                if (startDate > endDate) {
                  alert('From date must be earlier than or equal to To date');
                  return;
                }

                // Convert start/end to Date objects at midnight UTC to avoid timezone mismatches
                const start = new Date(startDate + 'T00:00:00');
                const end = new Date(endDate + 'T23:59:59');

                // Filter bills robustly: handle slashes or dashes, optional whitespace, and 2-digit years
                const filtered = bills.filter(bill => {
                  if (!bill || !bill.Date) return false;
                  // Normalize separators to '/'
                  const raw = String(bill.Date).trim().replace(/[-\.]/g, '/');
                  const parts = raw.split('/').map(p => p.trim());
                  if (parts.length !== 3) return false;
                  let [dStr, mStr, yStr] = parts;
                  const day = dStr.padStart(2, '0');
                  const month = mStr.padStart(2, '0');
                  const year = yStr.length === 2 ? '20' + yStr : yStr;
                  // Build an ISO date string and create Date
                  const billIso = `${year}-${month}-${day}`;
                  const billDate = new Date(billIso + 'T00:00:00');
                  if (Number.isNaN(billDate.getTime())) return false;
                  return billDate >= start && billDate <= end;
                });

                setDateFilteredBills(filtered);
                applyStatusFilter(filtered, statusFilter);
                setSearchType('range');
                setSuggestions([]);
                setSelectedBill(null);
                setProducts([]);
              }}
              style={{ marginLeft: '6px', borderRadius: '8px' }}
            >Apply Range</button>

            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setDisplayedBills([]);
                setDateFilteredBills([]);
                setStatusFilter('All');
                setSearchType('');
              }}
              style={{ marginLeft: '6px', borderRadius: '8px' }}
            >Clear</button>
          </div>
        </div>
      </div>





      <div className="container mt-4" style={{ maxWidth: "600px" }}>
        <div className="d-flex gap-3 align-items-center">
          <input
          type="text"
          className="form-control"
              placeholder="Search by Order ID or Date (day/month/year)"
          value={query}
          onChange={handleSearchChange}
          style={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
        />
        </div>

        {/* Status filter shown only for date/range/all searches (hide when searching by ID) */}
        {dateFilteredBills.length > 0 && searchType !== 'id' && (
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ margin: 0, fontWeight: 600, color: '#2f855a' }}>Filter by status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                const v = e.target.value;
                setStatusFilter(v);
                // Apply status filter on the date-filtered set
                applyStatusFilter(dateFilteredBills, v);
              }}
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Cash">Cash</option>
              <option value="Online">Online</option>
            </select>
          </div>
        )}

        {/* If dateFilteredBills exist but no displayedBills after status filter, show message (hide when a bill is selected) */}
        {dateFilteredBills.length > 0 && displayedBills.length === 0 && !selectedBill && (
          <div className="alert alert-warning mt-3" style={{ borderRadius: '8px', border: '1px solid #fbd38d', background: '#fff8e1' }}>
            {statusFilter && statusFilter !== 'All' ? (
              <span>No {statusFilter.toLowerCase()} bills found.</span>
            ) : (
              <span>No bills found for the selected date/range.</span>
            )}
          </div>
        )}

          {/* Show turnover for date/all search */}
          {displayedBills.length > 0 && (searchType === "date" || searchType === "all" || searchType === "range") && (
            <div className="alert alert-info mt-3" style={{ borderRadius: '8px', border: '1px solid #bee3f8', background: '#ebf8ff' }}>
              <strong>Total Bills Found:</strong> {displayedBills.length}
              <br />
              <strong>Daily Turnover:</strong> (&#8377;){totalTurnover.toFixed(2)}
        </div>
          )}

          {/* Multiple Bills Display for Date/All Search */}
          {displayedBills.length > 0 && (searchType === "date" || searchType === "all" || searchType === "range") && (
            <div className="mt-4">
              <h5 style={{ color: '#2d3748', marginBottom: '16px', fontWeight: '600' }}>
                📋 Bills Found ({displayedBills.length})
              </h5>
              <div style={{ 
                display: 'grid', 
                gap: '12px',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
              }}>
                {displayedBills.map((bill, index) => {
                  const billTotal =
                    bill.products.reduce((sum, p) => sum + p.price * p.quantity, 0) +
                    (bill.deliveryCharge || 0);
                  return (
                    <div
                      key={index}
                      className="card"
                      style={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                      }}
                      onClick={() => handleSuggestionClick(bill)}
                    >
                      <div className="card-body p-3">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '600', color: '#2d3748', fontSize: '0.9rem' }}>
                            🧾 {bill.order_id}
                          </span>
                          <span style={{ fontWeight: '700', color: '#38a169', fontSize: '1rem' }}>
                            (&#8377;){billTotal.toFixed(2)}
                          </span>
                        </div>
                        <div style={{ color: '#718096', fontSize: '0.85rem' }}>
                          📅 {bill.Date}
                        </div>
                        <div style={{ color: '#718096', fontSize: '0.85rem' }}>
                          📦 {bill.products.length} items
                        </div>
                        <div style={{ 
                          color: bill.status === 'Cash' ? '#38a169' : 
                                bill.status === 'Online' ? '#3182ce' : '#d69e2e', 
                          fontSize: '0.85rem', 
                          fontWeight: '500' 
                        }}>
                          📋 {bill.status || 'Pending'}
                        </div>
                        {bill.deliveryCharge > 0 && (
                          <div style={{ color: '#e53e3e', fontSize: '0.85rem', fontWeight: '500' }}>
                            💰 {bill.deliveryCharge} delivery charge
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggestions List for ID Search */}
        {suggestions.length > 0 && searchType === "id" && (
          <ul className="list-group mt-1" style={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
              {suggestions.map((item, index) => {
                const itemTotal =
                  item.products.reduce((sum, p) => sum + p.price * p.quantity, 0) +
                  (item.deliveryCharge || 0);
                return (
              <li
                key={index}
                    className="list-group-item list-group-item-action d-flex justify-content-between"
                onClick={() => handleSuggestionClick(item)}
                style={{ cursor: "pointer", borderBottom: '1px solid #e2e8f0' }}
              >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 500 }}>
                        🧾 {item.order_id} — 📅 {item.Date}
                      </span>
                      <span style={{ 
                        color: item.status === 'Cash' ? '#38a169' : 
                              item.status === 'Online' ? '#3182ce' : '#d69e2e', 
                        fontSize: '0.8rem', 
                        fontWeight: '500' 
                      }}>
                        📋 {item.status || 'Pending'}
                      </span>
                    </div>
                    <span className="text-success" style={{ fontWeight: 600 }}>(&#8377;){itemTotal.toFixed(2)}</span>
              </li>
                );
              })}
          </ul>
        )}

        {/* Show message for ID search with multiple results */}
        {suggestions.length > 1 && searchType === "id" && (
          <div className="alert alert-warning mt-3" style={{ borderRadius: '8px', border: '1px solid #fbd38d', background: '#fef5e7' }}>
            <strong>Multiple bills found!</strong> Please select a specific bill from the list above or enter the exact Bill ID.
          </div>
        )}


      </div>

        {selectedBill && (
      <>
      <div className="card p-4 mt-4" ref={billRef} style={{
        background: 'white',
        //borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        //border: '1px solid #e2e8f0'
      }} >
              <div className="d-flex mb-3 align-items-center">
                <h5 className="d-flex align-items-center">
                  <div 
                    style={{ 
                      width: "70px", 
                      height: "70px", 
                      borderRadius: "50%", 
                      overflow: "hidden",
                      marginRight: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#fff",
                      border: '2px solid #e2e8f0'
                    }}
                  >
                    <img
                      src="/OnlineBaazaar.jpeg"
                      alt="Shams Sports Logo"
                      style={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: "cover",
                        objectPosition: "center"
                      }}
                    />
                  </div>
                  <span style={{ color: "#1a202c", fontWeight: 700, fontSize: "1.5rem" }}>
                    OnlineBaazaar
                  </span>
                </h5>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  {/* Invoice ID removed; show Order ID above */}
                  <div
                style={{
                  fontWeight: 600,
                  color: "#4a5568",
                  marginBottom: "4px",
                }}
              >
                Order ID:
                <input
                  type="text"
                  value={selectedBill.order_id}
                  disabled
                  //onChange={(e) => setOrderId(e.target.value)}
                  maxLength={5} // ✅ Limit input length to 5 characters
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    backgroundColor : "white",
                    padding: "4px 8px",
                    marginLeft: "8px",
                    width: "70px", // Adjust width as needed
                    fontWeight: 500,
                  }}
                />
              </div>
                  <div style={{ fontWeight: 600, color: '#4a5568', marginBottom: '4px' }}>
                    Date: {selectedBill.Date}
                  </div>
                  <div className="bill-status-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                    <label style={{ color: '#4a5568', fontSize: '0.9rem', fontWeight: '500', margin: 0 }}>
                      Status:
                    </label>
                    <select
                      value={selectedStatus || selectedBill?.status || 'Pending'}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      disabled={selectedBill?.status && selectedBill.status !== 'Pending'}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        background: 'white',
                        color: '#2d3748',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        minWidth: '120px'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Cash">Cash</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>
                </div>
        </div>
        {/* (add-product search shown above the bill card when editing) */}

        <table className="table" style={{ borderRadius: '8px', overflow: 'hidden' }} >
          <thead style={{ background: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ width: '65%', fontWeight: 600, color: '#2d3748' }}>Product</th>
              <th style={{ width: '11.67%', fontWeight: 600, color: '#2d3748' }}>Quantity</th>
              <th style={{ width: '11.67%', fontWeight: 600, color: '#2d3748' }}>Price (&#8377;)</th>
              <th style={{ width: '11.67%', fontWeight: 600, color: '#2d3748' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td>
                  <input
                    value={p.name}
                    className="form-control"
                          readOnly
                          disabled
                          style={{ border: 'none', background: 'transparent', fontWeight: 500 }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={p.quantity}
                    className="form-control"
                          readOnly
                          disabled
                          style={{ border: 'none', background: 'transparent', fontWeight: 500 }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={p.price}
                    className="form-control"
                    readOnly
                    disabled
                    style={{ border: 'none', background: 'transparent', fontWeight: 500 }}
                  />
                </td>
                      <td style={{ fontWeight: 600, color: '#2d3748' }}>&#8377; {(p.price * p.quantity).toFixed(2)}</td>
                {/* remove button hidden in view-only mode */}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="totals-section">
          <div className="totals-row">
            <span className="totals-label">Subtotal :</span>
            <span className="totals-value">&#8377; {subtotal.toFixed(2)}</span>
          </div>
          {/* Profit and Profit by Category intentionally hidden */}
          <div className="totals-row">
            <span className="totals-label">Delivery Charge :</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#4a5568' }}>&#8377;</span>
              <input
                type="number"
                className="discount-input"
                value={deliveryCharge}
                readOnly
                disabled
              />
            </div>
          </div>
          <div className="totals-row total-row">
            <span className="totals-label">Total :</span>
            <span className="total-value">&#8377; {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

            {/* Action Buttons */}
      <div className="mt-4 d-flex justify-content-end gap-3">
        <button className="btn btn-outline-primary" onClick={printInvoice} style={{ borderRadius: '8px', fontWeight: 500, padding: '10px 24px' }}>
          🖨️ Print
        </button>
        <button className="btn btn-outline-success" onClick={downloadPDF} style={{ borderRadius: '8px', fontWeight: 500, padding: '10px 24px' }}>
          💾 Save Bill
        </button>
        <button className="btn btn-outline-warning" onClick={() => {
          const currentStatus = selectedBill.status || 'Pending';
          const newStatus = selectedStatus || currentStatus;
          if (currentStatus === newStatus) {
            alert('Please select a different status from the dropdown before clicking Change Status');
            return;
          }
          updateBillStatus(selectedBill._id, newStatus);
        }} style={{ borderRadius: '8px', fontWeight: 500, padding: '10px 24px' }}>
          🔄 Change Status: {selectedBill.status || 'Pending'} → {selectedStatus || selectedBill.status || 'Pending'}
        </button>
        <button className="btn btn-outline-danger" onClick={() => deleteBill(selectedBill._id)} style={{ borderRadius: '8px', fontWeight: 500, padding: '10px 24px' }}>
          🗑️ Delete Bill
        </button>
      </div>
      
      {/* Bottom spacing */}
      <div style={{ marginBottom: '50px' }}></div>
      </>
        )}
      </div>

      {/* <div style={{ marginTop: "193px" }}>
        <Footer />
    </div> */}
    </>
  );
}

