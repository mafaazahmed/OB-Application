// Test script for kg calculation logic
const testBillObject = {
  "_id": {"$oid":"68e2367e6528ec3f3a2c5eae"},
  "order_id":"X751",
  "products":[
    {
      "_id":"68e11b37c16f9d11cb2e9d00",
      "name":"Chicken 1/2kg",
      "quantity":{"$numberInt":"1"},
      "price":{"$numberInt":"125"},
      "profit":{"$numberInt":"40"}
    },
    {
      "_id":"68e11b37c16f9d11cb2e9d08",
      "name":"Beef 1/2kg",
      "quantity":{"$numberInt":"1"},
      "price":{"$numberInt":"150"},
      "profit":{"$numberInt":"35"}
    }
  ],
  "deliveryCharge":{"$numberInt":"14"},
  "total":{"$numberInt":"289"},
  "profit":{"$numberInt":"75"},
  "profitByCategory":[
    {"category":"chicken","amount":{"$numberInt":"40"},"_id":{"$oid":"68e2367e6528ec3f3a2c5eaf"}},
    {"category":"beef","amount":{"$numberInt":"35"},"_id":{"$oid":"68e2367e6528ec3f3a2c5eb0"}}
  ],
  "Date":"03/10/2025",
  "status":"Cash",
  "__v":{"$numberInt":"0"}
};

// Test function (same logic as in the route)
function calculateKgs(billObject) {
  // Initialize variables for total kgs
  let chickenKgs = 0;
  let beefKgs = 0;
  let muttonKgs = 0;

  // Helper function to convert size to kgs
  const convertToKgs = (size) => {
    size = size.toLowerCase().trim();
    
    // Handle kg sizes
    if (size.includes('1kg')) return 1;
    if (size.includes('3/4kg')) return 0.75;
    if (size.includes('1/2kg')) return 0.5;
    if (size.includes('1/4kg')) return 0.25;
    
    // Handle gram sizes for mutton
    if (size.includes('100gm')) return 0.1;
    if (size.includes('150gm')) return 0.15;
    if (size.includes('200gm')) return 0.2;
    if (size.includes('300gm')) return 0.3;
    if (size.includes('350gm')) return 0.35;
    if (size.includes('400gm')) return 0.4;
    
    return 0;
  };

  // Process each product in the bill
  billObject.products.forEach(product => {
    const productName = product.name.toLowerCase();
    const quantity = product.quantity || 0;
    
    // Extract size from product name
    let size = '';
    
    // Check for Chicken products
    if (productName.includes('chicken')) {
      if (productName.includes('boneless')) {
        // Extract size for boneless chicken
        if (productName.includes('1kg')) size = '1kg';
        else if (productName.includes('3/4kg')) size = '3/4kg';
        else if (productName.includes('1/2kg')) size = '1/2kg';
        else if (productName.includes('1/4kg')) size = '1/4kg';
      } else {
        // Extract size for regular chicken
        if (productName.includes('1kg')) size = '1kg';
        else if (productName.includes('3/4kg')) size = '3/4kg';
        else if (productName.includes('1/2kg')) size = '1/2kg';
        else if (productName.includes('1/4kg')) size = '1/4kg';
      }
      
      if (size) {
        chickenKgs += convertToKgs(size) * quantity;
      }
    }
    
    // Check for Beef products
    else if (productName.includes('beef')) {
      if (productName.includes('boneless')) {
        // Extract size for boneless beef
        if (productName.includes('1kg')) size = '1kg';
        else if (productName.includes('3/4kg')) size = '3/4kg';
        else if (productName.includes('1/2kg')) size = '1/2kg';
        else if (productName.includes('1/4kg')) size = '1/4kg';
      } else {
        // Extract size for regular beef
        if (productName.includes('1kg')) size = '1kg';
        else if (productName.includes('3/4kg')) size = '3/4kg';
        else if (productName.includes('1/2kg')) size = '1/2kg';
        else if (productName.includes('1/4kg')) size = '1/4kg';
      }
      
      if (size) {
        beefKgs += convertToKgs(size) * quantity;
      }
    }
    
    // Check for Mutton products
    else if (productName.includes('mutton')) {
      if (productName.includes('boneless')) {
        // Extract size for boneless mutton
        if (productName.includes('1kg')) size = '1kg';
        else if (productName.includes('3/4kg')) size = '3/4kg';
        else if (productName.includes('1/2kg')) size = '1/2kg';
        else if (productName.includes('1/4kg')) size = '1/4kg';
        else if (productName.includes('100gm')) size = '100gm';
        else if (productName.includes('150gm')) size = '150gm';
        else if (productName.includes('200gm')) size = '200gm';
        else if (productName.includes('300gm')) size = '300gm';
        else if (productName.includes('350gm')) size = '350gm';
        else if (productName.includes('400gm')) size = '400gm';
      } else {
        // Extract size for regular mutton
        if (productName.includes('1kg')) size = '1kg';
        else if (productName.includes('3/4kg')) size = '3/4kg';
        else if (productName.includes('1/2kg')) size = '1/2kg';
        else if (productName.includes('1/4kg')) size = '1/4kg';
        else if (productName.includes('100gm')) size = '100gm';
        else if (productName.includes('150gm')) size = '150gm';
        else if (productName.includes('200gm')) size = '200gm';
        else if (productName.includes('300gm')) size = '300gm';
        else if (productName.includes('350gm')) size = '350gm';
        else if (productName.includes('400gm')) size = '400gm';
      }
      
      if (size) {
        muttonKgs += convertToKgs(size) * quantity;
      }
    }
  });

  // Round to 2 decimal places
  chickenKgs = Math.round(chickenKgs * 100) / 100;
  beefKgs = Math.round(beefKgs * 100) / 100;
  muttonKgs = Math.round(muttonKgs * 100) / 100;

  return {
    chickenKgs,
    beefKgs,
    muttonKgs,
    totalKgs: Math.round((chickenKgs + beefKgs + muttonKgs) * 100) / 100
  };
}

// Test with the provided bill object
console.log('Testing with provided bill object:');
console.log('Products:', testBillObject.products.map(p => `${p.name} x${p.quantity}`));
console.log('');

const result = calculateKgs(testBillObject);
console.log('Results:');
console.log(`Chicken Kgs: ${result.chickenKgs}`);
console.log(`Beef Kgs: ${result.beefKgs}`);
console.log(`Mutton Kgs: ${result.muttonKgs}`);
console.log(`Total Kgs: ${result.totalKgs}`);
console.log('');

// Test with more complex examples
const complexBillObject = {
  products: [
    { name: "Chicken 1kg", quantity: 3 },
    { name: "Chicken 1/2kg Boneless", quantity: 2 },
    { name: "Beef 3/4kg", quantity: 1 },
    { name: "Mutton 300gm", quantity: 2 },
    { name: "Mutton 400gm Boneless", quantity: 3 }
  ]
};

console.log('Testing with complex example:');
console.log('Products:', complexBillObject.products.map(p => `${p.name} x${p.quantity}`));
console.log('');

const complexResult = calculateKgs(complexBillObject);
console.log('Results:');
console.log(`Chicken Kgs: ${complexResult.chickenKgs} (Expected: 4kg)`);
console.log(`Beef Kgs: ${complexResult.beefKgs} (Expected: 0.75kg)`);
console.log(`Mutton Kgs: ${complexResult.muttonKgs} (Expected: 1.8kg)`);
console.log(`Total Kgs: ${complexResult.totalKgs} (Expected: 6.55kg)`);
