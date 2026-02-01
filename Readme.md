# Car Import Manager - Japan to Bangladesh

A comprehensive web application for managing car imports from Japan to Bangladesh, with detailed cost tracking and inventory management.

## Features

### 1. **Dashboard**
- Real-time statistics of your inventory
- Quick overview of cars in transit, at port, and in showroom
- Recent cars added
- Upcoming payments

### 2. **Add New Car**
- Complete form for car details
- Cost breakdown by phase:
  - Japan costs (in JPY)
  - Shipping costs (in USD)
  - Bangladesh port costs (in BDT)
  - Inland Bangladesh costs (in BDT)
- Automatic cost calculation with exchange rates
- Status tracking

### 3. **Inventory Management**
- View all cars in a sortable table
- Filter by status (In Transit, At Port, In Showroom, Sold, etc.)
- Search by chassis number, make, or model
- View detailed information for each car
- Mark cars as sold with profit/loss calculation
- Edit or delete cars

### 4. **Cost Calculator**
- Estimate total landed cost based on FOB price
- Calculate Bangladesh customs duties (simplified)
- Suggested selling price with profit margin

### 5. **Reports**
- Visual charts of inventory status
- Cost distribution analysis
- Export data to CSV for further analysis

### 6. **Settings**
- Configure exchange rates (JPY/BDT, USD/BDT)
- Set default cost percentages
- Backup and restore data
- Clear all data

## How to Use

### First Time Setup:
1. Download all files to a folder
2. Open `index.html` in a modern web browser
3. No installation required - it runs directly in your browser

### Adding Your First Car:
1. Click "Add New Car" in the sidebar
2. Fill in basic car information
3. Enter costs in each section
4. Click "Calculate Total" to see estimated cost
5. Click "Save Car to Inventory"

### Managing Inventory:
1. Go to "Inventory" tab
2. Use search box to find specific cars
3. Filter by status using buttons
4. Click the eye icon to view detailed information
5. Click the check icon to mark a car as sold

### Changing Settings:
1. Go to "Settings" tab
2. Update exchange rates (check current rates)
3. Click "Save Settings"

## Data Storage

- All data is stored locally in your browser using localStorage
- No data is sent to any server
- You can backup data using the "Backup Data" button
- Data persists even after closing the browser

## Exchange Rates

Default exchange rates (update these regularly):
- 1 JPY = 1.05 BDT
- 1 USD = 110 BDT

**Important:** Update these rates in Settings based on current market rates.

## Important Notes

1. **Customs Duty Calculation:** The calculator provides estimates. Actual Bangladesh customs duties depend on:
   - Engine CC
   - Car age
   - Current government policies
   - Always verify with your C&F agent

2. **Data Backup:** Regularly backup your data using the backup feature

3. **Browser Compatibility:** Works best in Chrome, Firefox, or Edge

## For Developers

The application is built with:
- HTML5, CSS3, and vanilla JavaScript
- Chart.js for visualizations (loaded from CDN)
- Font Awesome icons (loaded from CDN)
- Responsive design for mobile and desktop

### File Structure:
- `index.html` - Main application structure
- `style.css` - All styles and responsive design
- `script.js` - Application logic and data management

## Support

This is a self-contained application. For issues or suggestions, you can:
1. Check browser console for errors (F12)
2. Clear browser cache if needed
3. Make sure JavaScript is enabled

## Disclaimer

The customs duty calculations are estimates only. Always verify actual costs with your customs agent. The developer is not responsible for any financial decisions made based on this software.