// Main Application
class CarImportManager {
    constructor() {
        this.cars = [];
        this.settings = {
            jpyRate: 1.05,
            usdRate: 110,
            auctionFeePercent: 4,
            agentCommissionPercent: 3
        };
        this.isEditing = false;
        this.currentEditId = null;
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateDashboard();
        this.showTab('dashboard');
    }
    
    loadData() {
        // Load cars from localStorage
        const savedCars = localStorage.getItem('carImportInventory');
        if (savedCars) {
            this.cars = JSON.parse(savedCars);
            console.log(`Loaded ${this.cars.length} cars from storage`);
        }
        
        // Load settings from localStorage
        const savedSettings = localStorage.getItem('carImportSettings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
            this.updateSettingsDisplay();
        }
        
        // Update exchange rate displays
        document.getElementById('jpy-rate').textContent = this.settings.jpyRate;
        document.getElementById('usd-rate').textContent = this.settings.usdRate;
    }
    
    saveData() {
        localStorage.setItem('carImportInventory', JSON.stringify(this.cars));
        localStorage.setItem('carImportSettings', JSON.stringify(this.settings));
        console.log(`Saved ${this.cars.length} cars to storage`);
    }
    
    setupEventListeners() {
        // Tab Navigation
        document.querySelectorAll('.sidebar li').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.showTab(tab);
                
                // Update active state
                document.querySelectorAll('.sidebar li').forEach(li => {
                    li.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
            });
        });
        
        // Add Car Form
        document.getElementById('add-car-form').addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.isEditing) {
                this.updateCar(this.currentEditId);
            } else {
                this.addNewCar();
            }
        });
        
        // Calculate Total Button
        document.getElementById('calculate-total').addEventListener('click', () => {
            this.calculateTotalCost();
        });
        
        // Reset form when clicking Add New Car tab
        document.querySelector('li[data-tab="add-car"]').addEventListener('click', () => {
            this.resetForm();
        });
        
        // Inventory Search
        document.getElementById('search-inventory').addEventListener('input', (e) => {
            this.filterInventory(e.target.value);
        });
        
        // Inventory Filter Buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.filterInventoryByStatus(filter);
                
                // Update active state
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
            });
        });
        
        // Cost Calculator
        document.getElementById('calculate-costs').addEventListener('click', () => {
            this.calculateEstimatedCosts();
        });
        
        // Settings
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });
        
        // Export Buttons
        document.getElementById('export-csv').addEventListener('click', () => {
            this.exportToCSV();
        });
        
        // Data Management
        document.getElementById('backup-data').addEventListener('click', () => {
            this.backupData();
        });
        
        document.getElementById('clear-data').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                localStorage.clear();
                this.cars = [];
                this.saveData();
                this.updateDashboard();
                this.renderInventory();
                this.showToast('All data cleared successfully', 'success');
            }
        });
        
        // Modal Close
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('car-detail-modal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }
    
    showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab
        document.getElementById(tabName).classList.add('active');
        
        // Update content based on tab
        switch(tabName) {
            case 'inventory':
                this.renderInventory();
                break;
            case 'reports':
                this.renderReports();
                break;
        }
    }
    
    updateSettingsDisplay() {
        document.getElementById('jpy-rate').textContent = this.settings.jpyRate;
        document.getElementById('usd-rate').textContent = this.settings.usdRate;
        document.getElementById('set-jpy-rate').value = this.settings.jpyRate;
        document.getElementById('set-usd-rate').value = this.settings.usdRate;
        document.getElementById('set-auction-fee-percent').value = this.settings.auctionFeePercent;
        document.getElementById('set-agent-commission-percent').value = this.settings.agentCommissionPercent;
    }
    
    saveSettings() {
        this.settings.jpyRate = parseFloat(document.getElementById('set-jpy-rate').value) || 1.05;
        this.settings.usdRate = parseFloat(document.getElementById('set-usd-rate').value) || 110;
        this.settings.auctionFeePercent = parseFloat(document.getElementById('set-auction-fee-percent').value) || 4;
        this.settings.agentCommissionPercent = parseFloat(document.getElementById('set-agent-commission-percent').value) || 3;
        
        this.saveData();
        this.updateSettingsDisplay();
        this.showToast('Settings saved successfully', 'success');
    }
    
    addNewCar() {
        try {
            // Collect form data
            const car = {
                id: Date.now().toString(),
                basicInfo: {
                    chassisNumber: document.getElementById('chassis-number').value,
                    make: document.getElementById('make').value,
                    model: document.getElementById('model').value,
                    year: parseInt(document.getElementById('year').value) || 2023,
                    color: document.getElementById('color').value,
                    engineCC: parseInt(document.getElementById('engine-cc').value) || 1500,
                    transmission: document.getElementById('transmission').value,
                    fuelType: document.getElementById('fuel-type').value,
                    auctionGrade: document.getElementById('auction-grade').value
                },
                costs: {
                    japan: {
                        carPrice: parseFloat(document.getElementById('car-price').value) || 0,
                        auctionFees: parseFloat(document.getElementById('auction-fees').value) || 0,
                        agentCommission: parseFloat(document.getElementById('agent-commission').value) || 0,
                        deregistrationFee: parseFloat(document.getElementById('deregistration-fee').value) || 0,
                        inlandTransportJP: parseFloat(document.getElementById('inland-transport-jp').value) || 0,
                        otherJapanCosts: parseFloat(document.getElementById('other-japan-costs').value) || 0
                    },
                    shipping: {
                        oceanFreight: parseFloat(document.getElementById('ocean-freight').value) || 0,
                        marineInsurance: parseFloat(document.getElementById('marine-insurance').value) || 0,
                        documentationFee: parseFloat(document.getElementById('documentation-fee').value) || 0
                    },
                    bdPort: {
                        portHandling: parseFloat(document.getElementById('port-handling').value) || 0,
                        customsDuty: parseFloat(document.getElementById('customs-duty').value) || 0,
                        supplementaryDuty: parseFloat(document.getElementById('supplementary-duty').value) || 0,
                        vat: parseFloat(document.getElementById('vat').value) || 0,
                        ait: parseFloat(document.getElementById('ait').value) || 0,
                        cfAgentFee: parseFloat(document.getElementById('cf-agent-fee').value) || 0
                    },
                    inlandBD: {
                        transportToShowroom: parseFloat(document.getElementById('transport-bd').value) || 0,
                        reconditioning: parseFloat(document.getElementById('reconditioning').value) || 0,
                        brtaFitness: parseFloat(document.getElementById('brta-fitness').value) || 0
                    }
                },
                status: document.getElementById('status').value,
                targetSellingPrice: parseFloat(document.getElementById('target-selling-price').value) || 0,
                notes: document.getElementById('notes').value,
                dateAdded: new Date().toISOString(),
                dateSold: null,
                sellingPrice: 0
            };
            
            // Validate required fields
            if (!car.basicInfo.chassisNumber || !car.basicInfo.make || !car.basicInfo.model) {
                this.showToast('Please fill in all required fields (Chassis, Make, Model)', 'error');
                return;
            }
            
            // Calculate total cost
            car.totalCost = this.calculateCarTotalCost(car);
            
            // Add to cars array
            this.cars.push(car);
            this.saveData();
            
            // Reset form
            this.resetForm();
            
            // Show success message
            this.showToast(`Car added successfully! Total cost: ৳${car.totalCost.toLocaleString()}`, 'success');
            
            // Update dashboard
            this.updateDashboard();
            
            // Switch to inventory tab
            this.showTab('inventory');
            this.renderInventory();
            
        } catch (error) {
            console.error('Error adding car:', error);
            this.showToast('Error adding car. Please check the form data.', 'error');
        }
    }
    
    updateCar(carId) {
        try {
            const carIndex = this.cars.findIndex(c => c.id === carId);
            if (carIndex === -1) {
                this.showToast('Car not found!', 'error');
                return;
            }
            
            const car = this.cars[carIndex];
            
            // Update car data from form
            car.basicInfo = {
                chassisNumber: document.getElementById('chassis-number').value,
                make: document.getElementById('make').value,
                model: document.getElementById('model').value,
                year: parseInt(document.getElementById('year').value) || 2023,
                color: document.getElementById('color').value,
                engineCC: parseInt(document.getElementById('engine-cc').value) || 1500,
                transmission: document.getElementById('transmission').value,
                fuelType: document.getElementById('fuel-type').value,
                auctionGrade: document.getElementById('auction-grade').value
            };
            
            car.costs = {
                japan: {
                    carPrice: parseFloat(document.getElementById('car-price').value) || 0,
                    auctionFees: parseFloat(document.getElementById('auction-fees').value) || 0,
                    agentCommission: parseFloat(document.getElementById('agent-commission').value) || 0,
                    deregistrationFee: parseFloat(document.getElementById('deregistration-fee').value) || 0,
                    inlandTransportJP: parseFloat(document.getElementById('inland-transport-jp').value) || 0,
                    otherJapanCosts: parseFloat(document.getElementById('other-japan-costs').value) || 0
                },
                shipping: {
                    oceanFreight: parseFloat(document.getElementById('ocean-freight').value) || 0,
                    marineInsurance: parseFloat(document.getElementById('marine-insurance').value) || 0,
                    documentationFee: parseFloat(document.getElementById('documentation-fee').value) || 0
                },
                bdPort: {
                    portHandling: parseFloat(document.getElementById('port-handling').value) || 0,
                    customsDuty: parseFloat(document.getElementById('customs-duty').value) || 0,
                    supplementaryDuty: parseFloat(document.getElementById('supplementary-duty').value) || 0,
                    vat: parseFloat(document.getElementById('vat').value) || 0,
                    ait: parseFloat(document.getElementById('ait').value) || 0,
                    cfAgentFee: parseFloat(document.getElementById('cf-agent-fee').value) || 0
                },
                inlandBD: {
                    transportToShowroom: parseFloat(document.getElementById('transport-bd').value) || 0,
                    reconditioning: parseFloat(document.getElementById('reconditioning').value) || 0,
                    brtaFitness: parseFloat(document.getElementById('brta-fitness').value) || 0
                }
            };
            
            car.status = document.getElementById('status').value;
            car.targetSellingPrice = parseFloat(document.getElementById('target-selling-price').value) || 0;
            car.notes = document.getElementById('notes').value;
            
            // Recalculate total cost
            car.totalCost = this.calculateCarTotalCost(car);
            
            // Update in array
            this.cars[carIndex] = car;
            this.saveData();
            
            // Reset form state
            this.resetForm();
            
            // Show success message
            this.showToast(`Car updated successfully! Total cost: ৳${car.totalCost.toLocaleString()}`, 'success');
            
            // Update UI
            this.updateDashboard();
            this.renderInventory();
            
            // Switch to inventory tab
            this.showTab('inventory');
            
        } catch (error) {
            console.error('Error updating car:', error);
            this.showToast('Error updating car. Please check the form data.', 'error');
        }
    }
    
    resetForm() {
        document.getElementById('add-car-form').reset();
        document.getElementById('car-detail-modal').style.display = 'none';
        document.getElementById('total-cost-display').style.display = 'none';
        
        // Reset edit mode
        this.isEditing = false;
        this.currentEditId = null;
        
        // Update form title and button
        document.querySelector('#add-car h2').innerHTML = '<i class="fas fa-plus-circle"></i> Add New Car';
        document.querySelector('#add-car .btn.primary').innerHTML = '<i class="fas fa-save"></i> Save Car to Inventory';
    }
    
    calculateCarTotalCost(car) {
        let total = 0;
        
        // Japan costs (convert JPY to BDT)
        total += car.costs.japan.carPrice * this.settings.jpyRate;
        total += car.costs.japan.auctionFees * this.settings.jpyRate;
        total += car.costs.japan.agentCommission * this.settings.jpyRate;
        total += car.costs.japan.deregistrationFee * this.settings.jpyRate;
        total += car.costs.japan.inlandTransportJP * this.settings.jpyRate;
        total += car.costs.japan.otherJapanCosts * this.settings.jpyRate;
        
        // Shipping costs (convert USD to BDT)
        total += car.costs.shipping.oceanFreight * this.settings.usdRate;
        total += car.costs.shipping.marineInsurance * this.settings.usdRate;
        total += car.costs.shipping.documentationFee * this.settings.usdRate;
        
        // Bangladesh costs (already in BDT)
        total += car.costs.bdPort.portHandling;
        total += car.costs.bdPort.customsDuty;
        total += car.costs.bdPort.supplementaryDuty;
        total += car.costs.bdPort.vat;
        total += car.costs.bdPort.ait;
        total += car.costs.bdPort.cfAgentFee;
        
        // Inland BD costs
        total += car.costs.inlandBD.transportToShowroom;
        total += car.costs.inlandBD.reconditioning;
        total += car.costs.inlandBD.brtaFitness;
        
        return Math.round(total);
    }
    
    calculateTotalCost() {
        const jpy = this.settings.jpyRate;
        const usd = this.settings.usdRate;
        
        let total = 0;
        
        // Japan costs
        total += (parseFloat(document.getElementById('car-price').value) || 0) * jpy;
        total += (parseFloat(document.getElementById('auction-fees').value) || 0) * jpy;
        total += (parseFloat(document.getElementById('agent-commission').value) || 0) * jpy;
        total += (parseFloat(document.getElementById('deregistration-fee').value) || 0) * jpy;
        total += (parseFloat(document.getElementById('inland-transport-jp').value) || 0) * jpy;
        total += (parseFloat(document.getElementById('other-japan-costs').value) || 0) * jpy;
        
        // Shipping costs
        total += (parseFloat(document.getElementById('ocean-freight').value) || 0) * usd;
        total += (parseFloat(document.getElementById('marine-insurance').value) || 0) * usd;
        total += (parseFloat(document.getElementById('documentation-fee').value) || 0) * usd;
        
        // Bangladesh costs
        total += parseFloat(document.getElementById('port-handling').value) || 0;
        total += parseFloat(document.getElementById('customs-duty').value) || 0;
        total += parseFloat(document.getElementById('supplementary-duty').value) || 0;
        total += parseFloat(document.getElementById('vat').value) || 0;
        total += parseFloat(document.getElementById('ait').value) || 0;
        total += parseFloat(document.getElementById('cf-agent-fee').value) || 0;
        
        // Inland BD costs
        total += parseFloat(document.getElementById('transport-bd').value) || 0;
        total += parseFloat(document.getElementById('reconditioning').value) || 0;
        total += parseFloat(document.getElementById('brta-fitness').value) || 0;
        
        // Show result
        const display = document.getElementById('total-cost-display');
        document.getElementById('total-cost-amount').textContent = 
            Math.round(total).toLocaleString() + ' BDT';
        display.style.display = 'block';
    }
    
    updateDashboard() {
        // Update statistics
        document.getElementById('total-cars').textContent = this.cars.length;
        
        const totalInvestment = this.cars.reduce((sum, car) => sum + (car.totalCost || 0), 0);
        document.getElementById('total-investment').textContent = 
            '৳' + totalInvestment.toLocaleString();
        
        // Count by status
        const statusCounts = {
            'purchased': 0,
            'in-transit': 0,
            'at-port': 0,
            'cleared': 0,
            'in-showroom': 0,
            'sold': 0
        };
        
        this.cars.forEach(car => {
            statusCounts[car.status] = (statusCounts[car.status] || 0) + 1;
        });
        
        document.getElementById('in-transit-count').textContent = statusCounts['in-transit'];
        document.getElementById('at-port-count').textContent = statusCounts['at-port'];
        document.getElementById('in-showroom-count').textContent = statusCounts['in-showroom'];
        document.getElementById('sold-count').textContent = statusCounts['sold'];
        
        // Show recent cars
        this.renderRecentCars();
        
        // Show upcoming payments
        this.renderUpcomingPayments();
    }
    
    renderRecentCars() {
        const container = document.getElementById('recent-cars-list');
        const recentCars = [...this.cars]
            .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
            .slice(0, 5);
        
        if (recentCars.length === 0) {
            container.innerHTML = '<p class="empty-message">No cars in inventory yet. Add your first car!</p>';
            return;
        }
        
        container.innerHTML = recentCars.map(car => `
            <div class="recent-car-item">
                <div class="car-info">
                    <strong>${car.basicInfo.make} ${car.basicInfo.model}</strong>
                    <span>${car.basicInfo.chassisNumber}</span>
                </div>
                <div class="car-status">
                    <span class="status-badge status-${car.status}">${car.status.replace('-', ' ')}</span>
                    <span class="car-cost">৳${(car.totalCost || 0).toLocaleString()}</span>
                </div>
            </div>
        `).join('');
    }
    
    renderUpcomingPayments() {
        const container = document.getElementById('upcoming-payments');
        const upcomingCars = this.cars.filter(car => 
            car.status === 'at-port' || car.status === 'purchased'
        ).slice(0, 5);
        
        if (upcomingCars.length === 0) {
            container.innerHTML = '<p class="empty-message">No upcoming payments</p>';
            return;
        }
        
        container.innerHTML = upcomingCars.map(car => `
            <div class="payment-item">
                <div class="payment-info">
                    <strong>${car.basicInfo.make} ${car.basicInfo.model}</strong>
                    <span>Estimated duty: ৳${(car.costs.bdPort.customsDuty || 0).toLocaleString()}</span>
                </div>
                <div class="payment-action">
                    <button class="action-btn" onclick="app.viewCarDetails('${car.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    renderInventory(filter = '', statusFilter = 'all') {
        const container = document.getElementById('inventory-table-body');
        
        let filteredCars = this.cars;
        
        // Apply search filter
        if (filter) {
            const searchLower = filter.toLowerCase();
            filteredCars = filteredCars.filter(car => 
                car.basicInfo.chassisNumber.toLowerCase().includes(searchLower) ||
                car.basicInfo.make.toLowerCase().includes(searchLower) ||
                car.basicInfo.model.toLowerCase().includes(searchLower)
            );
        }
        
        // Apply status filter
        if (statusFilter !== 'all') {
            filteredCars = filteredCars.filter(car => car.status === statusFilter);
        }
        
        if (filteredCars.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-table">
                        <i class="fas fa-car fa-2x"></i>
                        <p>No cars found matching your criteria</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        container.innerHTML = filteredCars.map(car => {
            const profitLoss = car.sellingPrice ? car.sellingPrice - car.totalCost : 0;
            const profitClass = profitLoss > 0 ? 'profit' : profitLoss < 0 ? 'loss' : '';
            
            return `
                <tr>
                    <td>${car.basicInfo.chassisNumber}</td>
                    <td>
                        <strong>${car.basicInfo.make} ${car.basicInfo.model}</strong><br>
                        <small>${car.basicInfo.year} | ${car.basicInfo.engineCC}cc | ${car.basicInfo.color}</small>
                    </td>
                    <td><span class="status-badge status-${car.status}">${car.status.replace('-', ' ')}</span></td>
                    <td>৳${(car.totalCost || 0).toLocaleString()}</td>
                    <td>${car.sellingPrice ? '৳' + car.sellingPrice.toLocaleString() : '৳' + (car.targetSellingPrice || 0).toLocaleString()}</td>
                    <td class="${profitClass}">
                        ${car.sellingPrice ? (profitLoss > 0 ? '+' : '') + profitLoss.toLocaleString() + ' BDT' : '-'}
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn" onclick="app.viewCarDetails('${car.id}')" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn" onclick="app.editCar('${car.id}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn" onclick="app.markAsSold('${car.id}')" title="Mark as Sold">
                                <i class="fas fa-check-circle"></i>
                            </button>
                            <button class="action-btn" onclick="app.deleteCar('${car.id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    filterInventory(searchTerm) {
        this.renderInventory(searchTerm);
    }
    
    filterInventoryByStatus(status) {
        this.renderInventory('', status);
    }
    
    viewCarDetails(carId) {
        const car = this.cars.find(c => c.id === carId);
        if (!car) return;
        
        const modal = document.getElementById('car-detail-modal');
        const content = document.getElementById('car-detail-content');
        
        // Calculate cost breakdown
        const jpy = this.settings.jpyRate;
        const usd = this.settings.usdRate;
        
        const japanCostBDT = (
            car.costs.japan.carPrice +
            car.costs.japan.auctionFees +
            car.costs.japan.agentCommission +
            car.costs.japan.deregistrationFee +
            car.costs.japan.inlandTransportJP +
            car.costs.japan.otherJapanCosts
        ) * jpy;
        
        const shippingCostBDT = (
            car.costs.shipping.oceanFreight +
            car.costs.shipping.marineInsurance +
            car.costs.shipping.documentationFee
        ) * usd;
        
        const bdPortCostBDT = (
            car.costs.bdPort.portHandling +
            car.costs.bdPort.customsDuty +
            car.costs.bdPort.supplementaryDuty +
            car.costs.bdPort.vat +
            car.costs.bdPort.ait +
            car.costs.bdPort.cfAgentFee
        );
        
        const inlandBDCostBDT = (
            car.costs.inlandBD.transportToShowroom +
            car.costs.inlandBD.reconditioning +
            car.costs.inlandBD.brtaFitness
        );
        
        content.innerHTML = `
            <h2>${car.basicInfo.make} ${car.basicInfo.model} - ${car.basicInfo.chassisNumber}</h2>
            
            <div class="car-detail-sections">
                <div class="detail-section">
                    <h3><i class="fas fa-info-circle"></i> Basic Information</h3>
                    <div class="detail-grid">
                        <div><strong>Year:</strong> ${car.basicInfo.year}</div>
                        <div><strong>Color:</strong> ${car.basicInfo.color}</div>
                        <div><strong>Engine:</strong> ${car.basicInfo.engineCC}cc</div>
                        <div><strong>Transmission:</strong> ${car.basicInfo.transmission}</div>
                        <div><strong>Fuel:</strong> ${car.basicInfo.fuelType}</div>
                        <div><strong>Auction Grade:</strong> ${car.basicInfo.auctionGrade}</div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3><i class="fas fa-yen-sign"></i> Cost Breakdown</h3>
                    <div class="cost-breakdown-modal">
                        <div class="cost-category">
                            <h4>Japan Costs</h4>
                            <p>${Math.round(japanCostBDT).toLocaleString()} BDT</p>
                        </div>
                        <div class="cost-category">
                            <h4>Shipping Costs</h4>
                            <p>${Math.round(shippingCostBDT).toLocaleString()} BDT</p>
                        </div>
                        <div class="cost-category">
                            <h4>BD Port Costs</h4>
                            <p>${Math.round(bdPortCostBDT).toLocaleString()} BDT</p>
                        </div>
                        <div class="cost-category">
                            <h4>Inland BD Costs</h4>
                            <p>${Math.round(inlandBDCostBDT).toLocaleString()} BDT</p>
                        </div>
                        <div class="cost-category total">
                            <h4>Total Landed Cost</h4>
                            <p><strong>${Math.round(car.totalCost).toLocaleString()} BDT</strong></p>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3><i class="fas fa-money-bill-wave"></i> Pricing</h3>
                    <div class="pricing-info">
                        <div class="pricing-item">
                            <span>Total Cost:</span>
                            <span>৳${Math.round(car.totalCost).toLocaleString()}</span>
                        </div>
                        <div class="pricing-item">
                            <span>Target Selling Price:</span>
                            <span>৳${(car.targetSellingPrice || 0).toLocaleString()}</span>
                        </div>
                        ${car.sellingPrice ? `
                        <div class="pricing-item">
                            <span>Actual Selling Price:</span>
                            <span>৳${car.sellingPrice.toLocaleString()}</span>
                        </div>
                        <div class="pricing-item ${car.sellingPrice > car.totalCost ? 'profit' : 'loss'}">
                            <span>Profit/Loss:</span>
                            <span>${car.sellingPrice > car.totalCost ? '+' : ''}৳${(car.sellingPrice - car.totalCost).toLocaleString()}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3><i class="fas fa-sticky-note"></i> Notes</h3>
                    <p>${car.notes || 'No notes available.'}</p>
                </div>
                
                <div class="detail-section">
                    <h3><i class="fas fa-history"></i> Timeline</h3>
                    <div class="timeline">
                        <div class="timeline-item ${car.status === 'purchased' ? 'active' : ''}">
                            <div class="timeline-dot"></div>
                            <div class="timeline-content">
                                <strong>Purchased in Japan</strong>
                                <small>${new Date(car.dateAdded).toLocaleDateString()}</small>
                            </div>
                        </div>
                        <div class="timeline-item ${car.status === 'in-transit' ? 'active' : ''}">
                            <div class="timeline-dot"></div>
                            <div class="timeline-content">
                                <strong>In Transit</strong>
                            </div>
                        </div>
                        <div class="timeline-item ${car.status === 'at-port' ? 'active' : ''}">
                            <div class="timeline-dot"></div>
                            <div class="timeline-content">
                                <strong>At BD Port</strong>
                            </div>
                        </div>
                        <div class="timeline-item ${car.status === 'in-showroom' ? 'active' : ''}">
                            <div class="timeline-dot"></div>
                            <div class="timeline-content">
                                <strong>In Showroom</strong>
                            </div>
                        </div>
                        <div class="timeline-item ${car.status === 'sold' ? 'active' : ''}">
                            <div class="timeline-dot"></div>
                            <div class="timeline-content">
                                <strong>Sold</strong>
                                ${car.dateSold ? `<small>${new Date(car.dateSold).toLocaleDateString()}</small>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    }
    
    editCar(carId) {
        const car = this.cars.find(c => c.id === carId);
        if (!car) {
            this.showToast('Car not found!', 'error');
            return;
        }
        
        // Switch to add car tab
        this.showTab('add-car');
        this.isEditing = true;
        this.currentEditId = carId;
        
        // Update form title and button
        document.querySelector('#add-car h2').innerHTML = '<i class="fas fa-edit"></i> Edit Car';
        document.querySelector('#add-car .btn.primary').innerHTML = '<i class="fas fa-save"></i> Update Car';
        
        // Populate basic information
        document.getElementById('chassis-number').value = car.basicInfo.chassisNumber;
        document.getElementById('make').value = car.basicInfo.make;
        document.getElementById('model').value = car.basicInfo.model;
        document.getElementById('year').value = car.basicInfo.year;
        document.getElementById('color').value = car.basicInfo.color;
        document.getElementById('engine-cc').value = car.basicInfo.engineCC;
        document.getElementById('transmission').value = car.basicInfo.transmission;
        document.getElementById('fuel-type').value = car.basicInfo.fuelType;
        document.getElementById('auction-grade').value = car.basicInfo.auctionGrade;
        
        // Populate Japan costs
        document.getElementById('car-price').value = car.costs.japan.carPrice;
        document.getElementById('auction-fees').value = car.costs.japan.auctionFees;
        document.getElementById('agent-commission').value = car.costs.japan.agentCommission;
        document.getElementById('deregistration-fee').value = car.costs.japan.deregistrationFee;
        document.getElementById('inland-transport-jp').value = car.costs.japan.inlandTransportJP;
        document.getElementById('other-japan-costs').value = car.costs.japan.otherJapanCosts;
        
        // Populate shipping costs
        document.getElementById('ocean-freight').value = car.costs.shipping.oceanFreight;
        document.getElementById('marine-insurance').value = car.costs.shipping.marineInsurance;
        document.getElementById('documentation-fee').value = car.costs.shipping.documentationFee;
        
        // Populate Bangladesh port costs
        document.getElementById('port-handling').value = car.costs.bdPort.portHandling;
        document.getElementById('customs-duty').value = car.costs.bdPort.customsDuty;
        document.getElementById('supplementary-duty').value = car.costs.bdPort.supplementaryDuty;
        document.getElementById('vat').value = car.costs.bdPort.vat;
        document.getElementById('ait').value = car.costs.bdPort.ait;
        document.getElementById('cf-agent-fee').value = car.costs.bdPort.cfAgentFee;
        
        // Populate Bangladesh inland costs
        document.getElementById('transport-bd').value = car.costs.inlandBD.transportToShowroom;
        document.getElementById('reconditioning').value = car.costs.inlandBD.reconditioning;
        document.getElementById('brta-fitness').value = car.costs.inlandBD.brtaFitness;
        
        // Populate status and pricing
        document.getElementById('status').value = car.status;
        document.getElementById('target-selling-price').value = car.targetSellingPrice;
        document.getElementById('notes').value = car.notes;
        
        // Calculate and show total cost
        this.calculateTotalCost();
        
        this.showToast(`Editing ${car.basicInfo.make} ${car.basicInfo.model}`, 'info');
    }
    
    markAsSold(carId) {
        const car = this.cars.find(c => c.id === carId);
        if (!car) return;
        
        const sellingPrice = prompt(`Enter selling price for ${car.basicInfo.make} ${car.basicInfo.model}:`, 
            car.targetSellingPrice || Math.round(car.totalCost * 1.2));
        
        if (sellingPrice && !isNaN(sellingPrice)) {
            car.status = 'sold';
            car.sellingPrice = parseFloat(sellingPrice);
            car.dateSold = new Date().toISOString();
            
            this.saveData();
            this.renderInventory();
            this.updateDashboard();
            
            const profit = car.sellingPrice - car.totalCost;
            this.showToast(`Car marked as sold! Profit: ৳${profit.toLocaleString()}`, 'success');
        }
    }
    
    deleteCar(carId) {
        if (confirm('Are you sure you want to delete this car? This action cannot be undone.')) {
            this.cars = this.cars.filter(c => c.id !== carId);
            this.saveData();
            this.renderInventory();
            this.updateDashboard();
            this.showToast('Car deleted successfully', 'success');
        }
    }
    
    calculateEstimatedCosts() {
        const engineCC = parseInt(document.getElementById('calc-engine-cc').value) || 1500;
        const fobPrice = parseFloat(document.getElementById('calc-fob-price').value) || 500000;
        const freight = parseFloat(document.getElementById('calc-freight').value) || 800;
        
        // Convert to BDT
        const fobBDT = fobPrice * this.settings.jpyRate;
        const freightBDT = freight * this.settings.usdRate;
        
        // Simplified duty calculation
        const cfrValue = fobBDT + freightBDT;
        
        let dutyRate = 0;
        if (engineCC <= 1500) dutyRate = 0.25;
        else if (engineCC <= 2000) dutyRate = 0.50;
        else if (engineCC <= 2500) dutyRate = 1.00;
        else if (engineCC <= 3000) dutyRate = 2.00;
        else dutyRate = 3.00;
        
        const customsDuty = cfrValue * dutyRate;
        const supplementaryDuty = cfrValue * 0.50;
        const vat = (cfrValue + customsDuty + supplementaryDuty) * 0.15;
        const otherTaxes = cfrValue * 0.05;
        
        const portFees = 50000;
        const inlandCosts = 100000;
        
        const totalCost = fobBDT + freightBDT + customsDuty + supplementaryDuty + vat + otherTaxes + portFees + inlandCosts;
        const sellingPrice = totalCost * 1.2;
        
        // Update display
        document.getElementById('calc-fob-result').textContent = Math.round(fobBDT).toLocaleString() + ' BDT';
        document.getElementById('calc-shipping-result').textContent = Math.round(freightBDT).toLocaleString() + ' BDT';
        document.getElementById('calc-duty-result').textContent = Math.round(customsDuty).toLocaleString() + ' BDT';
        document.getElementById('calc-sd-result').textContent = Math.round(supplementaryDuty).toLocaleString() + ' BDT';
        document.getElementById('calc-vat-result').textContent = Math.round(vat).toLocaleString() + ' BDT';
        document.getElementById('calc-other-taxes').textContent = Math.round(otherTaxes).toLocaleString() + ' BDT';
        document.getElementById('calc-port-fees').textContent = Math.round(portFees).toLocaleString() + ' BDT';
        document.getElementById('calc-total-cost').textContent = Math.round(totalCost).toLocaleString() + ' BDT';
        document.getElementById('calc-selling-price').textContent = Math.round(sellingPrice).toLocaleString() + ' BDT';
    }
    
    renderReports() {
        const statusCounts = {};
        this.cars.forEach(car => {
            statusCounts[car.status] = (statusCounts[car.status] || 0) + 1;
        });
        
        const statusChart = document.getElementById('status-chart');
        statusChart.innerHTML = Object.entries(statusCounts).map(([status, count]) => `
            <div class="status-bar">
                <span class="status-label">${status.replace('-', ' ')}</span>
                <div class="status-bar-container">
                    <div class="status-bar-fill" style="width: ${this.cars.length > 0 ? (count / this.cars.length) * 100 : 0}%">
                        ${count}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    exportToCSV() {
        if (this.cars.length === 0) {
            this.showToast('No data to export', 'warning');
            return;
        }
        
        const headers = ['Chassis No', 'Make', 'Model', 'Year', 'Status', 'Total Cost (BDT)', 'Selling Price (BDT)', 'Profit/Loss'];
        const rows = this.cars.map(car => [
            car.basicInfo.chassisNumber,
            car.basicInfo.make,
            car.basicInfo.model,
            car.basicInfo.year,
            car.status,
            car.totalCost,
            car.sellingPrice || car.targetSellingPrice || '',
            car.sellingPrice ? car.sellingPrice - car.totalCost : ''
        ]);
        
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `car-inventory-${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Data exported to CSV successfully', 'success');
    }
    
    backupData() {
        const backup = {
            cars: this.cars,
            settings: this.settings,
            backupDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(backup, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `car-import-backup-${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showToast('Backup created successfully', 'success');
    }
    
    closeModal() {
        document.getElementById('car-detail-modal').style.display = 'none';
    }
    
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.style.display = 'block';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CarImportManager();
});